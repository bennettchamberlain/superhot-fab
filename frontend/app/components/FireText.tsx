'use client';

import Link from 'next/link';
import {useEffect, useRef, type CSSProperties} from 'react';

const COLS = 48;
const ROWS = 16;
const FRAME_MS = 1000 / 18;

// Logo red → orange → yellow, with heat 0 fully transparent so the base text shows through.
const STOPS: Array<[number, [number, number, number, number]]> = [
  [0, [160, 20, 30, 0]],
  [0.2, [190, 30, 36, 0.8]],
  [0.45, [232, 80, 30, 0.95]],
  [0.7, [251, 170, 26, 1]],
  [1, [255, 244, 200, 1]],
];

function colorAt(heat: number) {
  const t = Math.min(Math.max(heat, 0), 1);
  const upper = Math.max(STOPS.findIndex(([at]) => at >= t), 1);
  const [fromAt, from] = STOPS[upper - 1];
  const [toAt, to] = STOPS[upper];
  const mix = (t - fromAt) / (toAt - fromAt);
  return from.map((channel, i) => channel + (to[i] - channel) * mix);
}

const PALETTE = Array.from({length: 256}, (_, i) => {
  const [r, g, b, a] = colorAt(i / 255);
  return [Math.round(r), Math.round(g), Math.round(b), Math.round(a * 255)];
});

const fadeMask = 'linear-gradient(to top, #000 45%, transparent 95%)';
const overlayStyle: CSSProperties = {
  backgroundSize: '100% 100%',
  backgroundRepeat: 'no-repeat',
  WebkitTextFillColor: 'transparent',
  WebkitMaskImage: fadeMask,
  maskImage: fadeMask,
};

function FireLine({text, textClassName, shadowClassName}: {text: string; textClassName: string; shadowClassName: string}) {
  const overlayRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const canvas = document.createElement('canvas');
    canvas.width = COLS;
    canvas.height = ROWS;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const heat = new Float32Array(COLS * ROWS);
    const next = new Float32Array(COLS * ROWS);
    const base = new Float32Array(COLS).fill(0.8);
    const target = new Float32Array(COLS).fill(0.8);
    const image = ctx.createImageData(COLS, ROWS);
    let frame = 0;
    let last = 0;

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      // Desktop and mobile navbars are both mounted; only the visible one burns.
      if (now - last < FRAME_MS || overlay.getClientRects().length === 0) return;
      last = now;

      for (let x = 0; x < COLS; x++) {
        if (Math.random() < 0.06) target[x] = 0.15 + Math.random() * 0.9;
        base[x] += (target[x] - base[x]) * 0.15;
        heat[(ROWS - 1) * COLS + x] = base[x];
      }
      for (let y = 0; y < ROWS - 1; y++) {
        const below = (y + 1) * COLS;
        const below2 = Math.min(y + 2, ROWS - 1) * COLS;
        for (let x = 0; x < COLS; x++) {
          const left = heat[below + Math.max(x - 1, 0)];
          const right = heat[below + Math.min(x + 1, COLS - 1)];
          const sum = left + heat[below + x] * 2 + right + heat[below2 + x];
          next[y * COLS + x] = Math.max(sum / 5 - 0.02 - Math.random() * 0.03, 0);
        }
      }
      heat.set(next.subarray(0, (ROWS - 1) * COLS));

      for (let i = 0; i < heat.length; i++) {
        const color = PALETTE[Math.min((heat[i] * 255) | 0, 255)];
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
  }, []);

  return (
    <span className="relative block">
      <span className={`${textClassName} ${shadowClassName}`} style={{WebkitTextFillColor: '#FFB81C'}}>
        {text}
      </span>
      <span
        ref={overlayRef}
        aria-hidden
        className={`pointer-events-none absolute inset-0 bg-clip-text ${textClassName}`}
        style={overlayStyle}
      >
        {text}
      </span>
    </span>
  );
}

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
  return (
    <Link href={href} className={className}>
      <span className="flex flex-col">
        {lines.map((line) => (
          <FireLine key={line} text={line} textClassName={textClassName} shadowClassName={shadowClassName} />
        ))}
      </span>
    </Link>
  );
}
