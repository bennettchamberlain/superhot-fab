'use client';

import Link from 'next/link';
import {useEffect, useRef, type CSSProperties} from 'react';

const COLS = 48;
const ROWS_PER_LINE = 16;
const FRAME_MS = 1000 / 18;
const COOLING = 0.09;
const COOLING_JITTER = 0.03;
// Roughly one flare every 9s; flares are the only flames tall enough to reach the line above.
const FLARE_CHANCE = 0.006;

// Red tips → orange → yellow base, with heat 0 fully transparent so the base text shows through.
// Normal flames top out at yellow; only flares get hot enough to go pale.
const MAX_HEAT = 2.4;
const STOPS: Array<[number, [number, number, number, number]]> = [
  [0, [160, 20, 30, 0]],
  [0.25, [190, 30, 36, 0.85]],
  [0.55, [232, 80, 30, 1]],
  [0.95, [251, 170, 26, 1]],
  [1.4, [255, 214, 70, 1]],
  [MAX_HEAT, [255, 244, 200, 1]],
];

function colorAt(heat: number) {
  const t = Math.min(Math.max(heat, 0), MAX_HEAT);
  const upper = Math.max(STOPS.findIndex(([at]) => at >= t), 1);
  const [fromAt, from] = STOPS[upper - 1];
  const [toAt, to] = STOPS[upper];
  const mix = (t - fromAt) / (toAt - fromAt);
  return from.map((channel, i) => channel + (to[i] - channel) * mix);
}

const PALETTE = Array.from({length: 256}, (_, i) => {
  const [r, g, b, a] = colorAt((i / 255) * MAX_HEAT);
  return [Math.round(r), Math.round(g), Math.round(b), Math.round(a * 255)];
});

/** A fire burning upward from `sourceRow`; rows below the source stay cold. */
function createFire(rows: number, sourceRow: number, minHeat: number, maxHeat: number, flares: boolean) {
  const heat = new Float32Array(COLS * rows);
  const next = new Float32Array(COLS * rows);
  const base = new Float32Array(COLS).fill((minHeat + maxHeat) / 2);
  const target = new Float32Array(COLS).fill((minHeat + maxHeat) / 2);
  const flareLife = new Uint8Array(COLS);
  const flareHeat = new Float32Array(COLS);

  const step = () => {
    if (flares && Math.random() < FLARE_CHANCE) {
      const center = (Math.random() * COLS) | 0;
      const halfWidth = 2 + ((Math.random() * 2) | 0);
      // A flare climbs about one row per frame while it lives, so its life sets how high it reaches.
      const life = 10 + ((Math.random() * 24) | 0);
      const strength = 2.4 + Math.random() * 0.6;
      for (let x = Math.max(center - halfWidth, 0); x <= Math.min(center + halfWidth, COLS - 1); x++) {
        flareLife[x] = life;
        flareHeat[x] = strength;
      }
    }
    for (let x = 0; x < COLS; x++) {
      if (Math.random() < 0.08) target[x] = minHeat + Math.random() * (maxHeat - minHeat);
      base[x] += (target[x] - base[x]) * 0.15;
      if (flareLife[x]) flareLife[x]--;
      heat[sourceRow * COLS + x] = flareLife[x] ? flareHeat[x] : base[x];
    }
    for (let y = 0; y < sourceRow; y++) {
      const below = (y + 1) * COLS;
      const below2 = Math.min(y + 2, sourceRow) * COLS;
      for (let x = 0; x < COLS; x++) {
        const left = heat[below + Math.max(x - 1, 0)];
        const right = heat[below + Math.min(x + 1, COLS - 1)];
        const sum = left + heat[below + x] * 3 + right + heat[below2 + x];
        const cooling = (COOLING + Math.random() * COOLING_JITTER) * (flareLife[x] ? 0.3 : 1);
        next[y * COLS + x] = Math.max(sum / 6 - cooling, 0);
      }
    }
    heat.set(next.subarray(0, sourceRow * COLS));
  };

  return {heat, step};
}

const overlayStyle: CSSProperties = {
  backgroundSize: '100% 100%',
  backgroundRepeat: 'no-repeat',
  WebkitTextFillColor: 'transparent',
};

export default function FireText({
  href,
  lines,
  className = '',
  textClassName = '',
  shadowClassName = '',
}: {
  href: string;
  lines: string[];
  className?: string;
  /** Typography shared by the text and the fire overlay so the two line up. */
  textClassName?: string;
  shadowClassName?: string;
}) {
  const overlayRef = useRef<HTMLSpanElement>(null);
  const lineCount = lines.length;

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const rows = ROWS_PER_LINE * lineCount;
    const canvas = document.createElement('canvas');
    canvas.width = COLS;
    canvas.height = rows;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Each line burns from its own baseline; only the bottom line flares up into the lines above.
    const fires = Array.from({length: lineCount}, (_, line) => {
      const isBottom = line === lineCount - 1;
      return createFire(rows, (line + 1) * ROWS_PER_LINE - 1, isBottom ? 0.6 : 0.4, isBottom ? 1.3 : 0.9, isBottom);
    });
    const image = ctx.createImageData(COLS, rows);
    let frame = 0;
    let last = 0;

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      // Desktop and mobile navbars are both mounted; only the visible one burns.
      if (now - last < FRAME_MS || overlay.getClientRects().length === 0) return;
      last = now;

      for (const fire of fires) fire.step();
      for (let i = 0; i < COLS * rows; i++) {
        let value = 0;
        for (const fire of fires) value = Math.max(value, fire.heat[i]);
        const color = PALETTE[Math.min(((value / MAX_HEAT) * 255) | 0, 255)];
        const offset = i * 4;
        image.data[offset] = color[0];
        image.data[offset + 1] = color[1];
        image.data[offset + 2] = color[2];
        image.data[offset + 3] = color[3];
      }
      ctx.putImageData(image, 0, 0);
      overlay.style.backgroundImage = `url(${canvas.toDataURL()})`;
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [lineCount]);

  return (
    <Link href={href} className={className}>
      <span className="relative flex flex-col">
        {lines.map((line) => (
          <span key={line} className={`block ${textClassName} ${shadowClassName}`} style={{WebkitTextFillColor: '#FFB81C'}}>
            {line}
          </span>
        ))}
        <span
          ref={overlayRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 flex flex-col bg-clip-text"
          style={overlayStyle}
        >
          {lines.map((line) => (
            <span key={line} className={`block ${textClassName}`}>
              {line}
            </span>
          ))}
        </span>
      </span>
    </Link>
  );
}
