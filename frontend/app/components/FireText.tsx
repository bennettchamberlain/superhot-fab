'use client';

import Link from 'next/link';
import {useEffect, useRef, type CSSProperties} from 'react';

// Pixel fire rising through the wordmark, anchored to the baseline.
const COLS = 64;
const ROWS = Math.round(COLS * (946 / 862));
const FRAME_MS = 1000 / 30;
const MAX_HEAT = 36;

const STOPS: Array<[number, [number, number, number, number]]> = [
  [0, [200, 39, 42, 0]],
  [0.3, [200, 39, 42, 0.45]],
  [0.55, [238, 107, 34, 0.7]],
  [0.8, [251, 180, 26, 0.8]],
  [1, [255, 236, 170, 0.85]],
];

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

const overlayStyle: CSSProperties = {
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'left bottom',
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

    const canvas = document.createElement('canvas');
    canvas.width = COLS;
    canvas.height = ROWS;
    const ctx = canvas.getContext('2d');
    const display = document.createElement('canvas');
    const displayCtx = display.getContext('2d');
    if (!ctx || !displayCtx) return;

    const heat = new Uint8Array(COLS * ROWS);
    const base = new Uint8Array(COLS).fill(MAX_HEAT);
    const image = ctx.createImageData(COLS, ROWS);
    let frame = 0;
    let last = 0;

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      if (now - last < FRAME_MS || overlay.getClientRects().length === 0) return;
      last = now;

      const rect = overlay.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return;

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

      // Keep the logo's pixels crisp and span the whole wordmark, anchored to the bottom.
      const dw = Math.max(1, Math.ceil(rect.width));
      const dh = Math.max(1, Math.ceil(dw * (ROWS / COLS)));
      if (display.width !== dw || display.height !== dh) {
        display.width = dw;
        display.height = dh;
      }
      displayCtx.imageSmoothingEnabled = false;
      displayCtx.clearRect(0, 0, dw, dh);
      displayCtx.drawImage(canvas, 0, 0, dw, dh);
      overlay.style.backgroundSize = `${dw}px ${dh}px`;
      overlay.style.backgroundImage = `url(${display.toDataURL()})`;
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
