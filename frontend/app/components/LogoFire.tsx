'use client';

import Image from 'next/image';
import {useEffect, useRef, type CSSProperties} from 'react';

const LOGO = '/assets/images/superhotfin.png';
const LOGO_ASPECT = 946 / 862;
const COLS = 64;
const ROWS = Math.round(COLS * LOGO_ASPECT);
const FRAME_MS = 1000 / 30;

// Heat 0 is transparent; the top of the ramp is the logo's yellow pushed toward white.
const STOPS: Array<[number, [number, number, number, number]]> = [
  [0, [200, 39, 42, 0]],
  [0.3, [200, 39, 42, 0.45]],
  [0.55, [238, 107, 34, 0.7]],
  [0.8, [251, 180, 26, 0.8]],
  [1, [255, 236, 170, 0.85]],
];
const MAX_HEAT = 36;

const PALETTE = Array.from({length: MAX_HEAT + 1}, (_, heat) => {
  const t = heat / MAX_HEAT;
  const upper = STOPS.findIndex(([at]) => at >= t);
  const [fromAt, from] = STOPS[Math.max(upper - 1, 0)];
  const [toAt, to] = STOPS[upper];
  const mix = toAt === fromAt ? 0 : (t - fromAt) / (toAt - fromAt);
  return from.map((channel, index) => {
    const value = channel + (to[index] - channel) * mix;
    return index === 3 ? Math.round(value * 255) : Math.round(value);
  });
});

const fireMask = `url(${LOGO}), linear-gradient(to top, #000 30%, transparent 55%)`;
const maskStyle: CSSProperties = {
  WebkitMaskImage: fireMask,
  maskImage: fireMask,
  WebkitMaskSize: '100% 100%',
  maskSize: '100% 100%',
  WebkitMaskRepeat: 'no-repeat',
  maskRepeat: 'no-repeat',
  WebkitMaskComposite: 'source-in',
  maskComposite: 'intersect',
};

export default function LogoFire({size, glowClassName}: {size: number; glowClassName: string}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const height = Math.round(size * LOGO_ASPECT);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const heat = new Uint8Array(COLS * ROWS);
    // Uneven heat along the base is what splits the glow into separate tongues.
    const base = new Uint8Array(COLS).fill(MAX_HEAT);
    const image = ctx.createImageData(COLS, ROWS);
    let frame = 0;
    let last = 0;

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      // The mobile and desktop logos are both mounted; only the visible one burns.
      if (now - last < FRAME_MS || canvas.getClientRects().length === 0) return;
      last = now;

      for (let x = 0; x < COLS; x++) {
        if (Math.random() < 0.1) base[x] = MAX_HEAT - ((Math.random() * 12) | 0);
        heat[(ROWS - 1) * COLS + x] = base[x];
      }
      for (let y = 1; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
          const src = y * COLS + x;
          const value = heat[src];
          const roll = (Math.random() * 4) | 0;
          const dst = Math.min(Math.max(src - COLS - roll + 1, 0), heat.length - 1);
          const cool = (roll & 1) + (Math.random() < 0.75 ? 1 : 0);
          heat[dst] = value > cool ? value - cool : 0;
        }
      }

      for (let i = 0; i < heat.length; i++) {
        const color = PALETTE[heat[i]];
        const offset = i * 4;
        image.data[offset] = color[0];
        image.data[offset + 1] = color[1];
        image.data[offset + 2] = color[2];
        image.data[offset + 3] = color[3];
      }
      ctx.putImageData(image, 0, 0);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="relative animate-float" style={{width: size, height}}>
      <Image
        src={LOGO}
        alt="Superhot Fabrication Logo"
        width={size}
        height={height}
        className={`h-full w-full object-contain ${glowClassName}`}
        priority
      />
      <canvas
        ref={canvasRef}
        aria-hidden
        width={COLS}
        height={ROWS}
        className="pointer-events-none absolute inset-0 h-full w-full"
        style={maskStyle}
      />
    </div>
  );
}
