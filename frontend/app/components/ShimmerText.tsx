'use client';

import {useEffect, useRef} from 'react';
import Link from 'next/link';

type LabelColor = 'yellow' | 'orange' | 'red' | 'white';

interface ShimmerTextProps {
  href?: string;
  /** Single-line label */
  label?: string;
  /** Multi-line label – each entry rendered on its own line */
  lines?: string[];
  color: LabelColor;
  className?: string;
  textClassName?: string;
  onClick?: () => void;
}

export default function ShimmerText({
  href,
  label,
  lines,
  color,
  className = '',
  textClassName = '',
  onClick,
}: ShimmerTextProps) {
  const spanRef = useRef<HTMLSpanElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const span = spanRef.current;
    if (!span) return;

    const c = document.createElement('canvas');
    const ctx = c.getContext('2d');
    if (!ctx) return;

    const wh = 128;
    const w2h = wh * wh;
    c.width = c.height = wh;

    const img = ctx.createImageData(wh, wh);
    const id = img.data;

    const inc = 1 / wh;

    const arr: number[] = new Array(w2h);
    for (let k = 0; k < w2h; ++k) arr[k] = Math.random() * 1.5 - 0.5;

    /** DARKER hues + bright highlights — deep saturation, glow only on peaks */
    const colorFn = (v: number) => {
      v = Math.min(Math.max(v, 0.2), 1);
      v = Math.pow(v, 1.5);              // darken base hues / push midtones down
      v *= 1.25;                          // slight contrast boost
      const glow = Math.pow(v, 0.3) * 0.5; // glow only on bright highlights
      v += glow;
      return 255 * Math.min(v, 1);
    };

    const interp = (a: number, b: number, tt: number) => {
      tt = tt * tt * tt * (6 * tt * tt - 15 * tt + 10);
      return a + (b - a) * tt;
    };

    const noise = (x: number, y: number) => {
      const i = Math.abs(Math.floor(x) * wh + Math.floor(y)) % w2h;
      return arr[i];
    };

    const p = (x: number, y: number) => {
      const nx = Math.floor(x);
      const ny = Math.floor(y);
      return interp(
        interp(noise(nx, ny),     noise(nx + 1, ny),     x - nx),
        interp(noise(nx, ny + 1), noise(nx + 1, ny + 1), x - nx),
        y - ny,
      );
    };

    const oct = (x: number, y: number) => p(x * 3.0, y * 4.0) + p(x * 4.0, y * 5.0) * 0.5;

    // Draw once without animation
    for (let x = 1; x >= 0; x -= inc) {
      for (let y = 1; y >= 0; y -= inc) {
        const idx = (y * wh + x) * wh * 4;

        const dist = Math.sqrt(x * x + y * y);

        const ax = oct(x, y);
        const ay = oct(x + 2, y);

        const bx = oct(x + dist * 0.3 + ax / 22 + 0.7, y + ay / 5 + 2);
        const by = oct(x + ax / 3,              y + ay / 3 + 5);

        const no = oct(x + bx / 5, y + by / 2) * 0.7 + 0.15;
        const d  = ax * by / 2;
        const e  = ay * bx / 2;

        id[idx + 0] = colorFn(no + d / 5);
        id[idx + 1] = colorFn(no / 3 + e / 5 + d);
        id[idx + 2] = colorFn(d + e);
        // keep fully opaque — CSS bg-clip-text uses text shape as the mask
        id[idx + 3] = 255;
      }
    }

    ctx.putImageData(img, 0, 0);

    if (span) {
      span.style.backgroundImage = `url(${c.toDataURL()})`;
    }
  }, [color]);

  const content = lines ? lines.join('\n') : (label ?? '');

  // White labels skip the canvas texture entirely
  if (color === 'white') {
    const inner = (
      <span
        className={textClassName}
        style={{ color: '#ffffff', whiteSpace: lines ? 'pre-line' : undefined }}
      >
        {content}
      </span>
    );
    if (href) return <Link href={href} className={className} onClick={onClick}>{inner}</Link>;
    return <span className={className} onClick={onClick}>{inner}</span>;
  }

  const inner = (
    <span
      ref={spanRef}
      className={`text-transparent bg-clip-text ${textClassName}`}
      style={{
        backgroundSize: '100% 100%',
        backgroundRepeat: 'no-repeat',
        WebkitTextFillColor: 'transparent',
        color: color === 'orange' ? '#FFB81C' : color === 'yellow' ? '#FFD000' : color === 'red' ? '#FF3B1C' : undefined,
        whiteSpace: lines ? 'pre-line' : undefined,
      }}
    >
      {content}
    </span>
  );

  if (href) {
    return (
      <Link href={href} className={className} onClick={onClick}>
        {inner}
      </Link>
    );
  }

  return <span className={className} onClick={onClick}>{inner}</span>;
}
