'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';

type LabelColor = 'yellow' | 'orange' | 'red';

interface ShimmerLabelProps {
  href: string;
  label: string;
  color: LabelColor;
  className?: string;
}

// R, G, B multipliers to tint the plasma shader toward each brand color
const COLOR_TINTS: Record<LabelColor, [number, number, number]> = {
  yellow: [1.0, 0.85, 0.0],
  orange: [1.0, 0.38, 0.0],
  red:    [1.0, 0.0,  0.0],
};

const TEXT_COLORS: Record<LabelColor, string> = {
  yellow: '#FFB81C',
  orange: '#FA4616',
  red:    '#DA291C',
};

export default function ShimmerLabel({ href, label, color, className = '' }: ShimmerLabelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;

    const wh = 128;
    const w2h = wh * wh;
    c.width = c.height = wh;

    const img = ctx.createImageData(wh, wh);
    const id = img.data;

    let t = 0;
    const inc = 1 / wh;

    const [tr, tg, tb] = COLOR_TINTS[color];

    // Pre-fill random lookup array
    const arr: number[] = new Array(w2h);
    for (let k = 0; k < w2h; ++k) arr[k] = Math.random() * 1.5 - 0.5;

    const hue = (v: number) => 255 * Math.min(Math.max(v, 0), 1);

    const ease = (x: number) => (x > 0.2 ? 0 : interp(1, 0, x * 6));

    const interp = (a: number, b: number, tt: number) => {
      tt = tt * tt * tt * (6 * tt * tt - 15 * tt + 10);
      return a + (b - a) * tt;
    };

    const n = (x: number, y: number) => {
      const i = Math.abs(Math.floor(x) * wh + Math.floor(y)) % w2h;
      return arr[i];
    };

    const p = (x: number, y: number) => {
      const nx = Math.floor(x);
      const ny = Math.floor(y);
      return interp(
        interp(n(nx, ny), n(nx + 1, ny), x - nx),
        interp(n(nx, ny + 1), n(nx + 1, ny + 1), x - nx),
        y - ny,
      );
    };

    const oct = (x: number, y: number) =>
      p(x * 3.0, y * 4.0) + p(x * 4.0, y * 5.0) * 0.5;

    const draw = () => {
      rafRef.current = window.requestAnimationFrame(draw);
      t += inc;

      for (let x = 1; x >= 0; x -= inc) {
        for (let y = 1; y >= 0; y -= inc) {
          // Faithful to original issue code (intentional aliasing via float idx)
          const idx = (y * wh + x) * wh * 4;
          const dist = Math.sqrt(x * x + y * y);

          const ax = oct(x, y);
          const ay = oct(x + 2, y + t / 3);
          const bx = oct(x + dist * 0.3 + ax / 22 + 0.7, y + ay / 5 + 2);
          const by = oct(x + ax / 3 + 4 * t, y + ay / 3 + 5);
          const no = oct(x + bx / 5, y + by / 2) * 0.7 + 0.15;
          const d = ax * by / 2;
          const e = ay * bx / 2;

          id[idx + 0] = hue((no + d / 5) * tr);
          id[idx + 1] = hue((no / 3 + e / 5 + d) * tg);
          id[idx + 2] = hue((d + e) * tb);
          id[idx + 3] = hue(1 - ease(dist) * (e + d) * 5);
        }
      }
      ctx.putImageData(img, 0, 0);
    };

    draw();

    return () => window.cancelAnimationFrame(rafRef.current);
  }, [color]);

  return (
    <Link
      href={href}
      className={`relative inline-flex items-center justify-center px-8 py-4 cursor-pointer group select-none ${className}`}
    >
      {/* Canvas shimmer background */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          imageRendering: 'pixelated',
          borderRadius: '6px',
          opacity: 0.75,
        }}
      />
      {/* Label text */}
      <span
        className="relative z-10 text-2xl md:text-3xl font-extrabold uppercase tracking-widest transition-all duration-200 group-hover:scale-110 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
        style={{ color: TEXT_COLORS[color], textShadow: `0 0 20px ${TEXT_COLORS[color]}88` }}
      >
        {label}
      </span>
    </Link>
  );
}
