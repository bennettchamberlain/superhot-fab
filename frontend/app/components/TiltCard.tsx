'use client';

import { useRef, useEffect, type RefObject } from 'react';

interface TiltCardProps {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** Ref to the container element that should capture mouse events (e.g. the clip-path parent) */
  zoneRef?: RefObject<HTMLDivElement | null>;
}

export default function TiltCard({ children, className = '', style, zoneRef }: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    // Use external zone, or auto-detect parent element as the event zone
    const zone = (zoneRef?.current ?? card.parentElement) as HTMLElement | null;
    if (!zone) return;

    const maxTilt = 32;
    const scaleVal = 1.12;
    const lerpSpeed = 0.06;

    let mx = 0.5;
    let my = 0.5;
    let smx = 0.5;
    let smy = 0.5;
    let rx = 0;
    let ry = 0;
    let sc = 1;
    let inside = false;
    let bgOpacity = 0;
    let raf: number;

    const onMove = (e: MouseEvent) => {
      const r = zone.getBoundingClientRect();
      mx = Math.min(Math.max((e.clientX - r.left) / r.width, 0), 1);
      my = Math.min(Math.max((e.clientY - r.top) / r.height, 0), 1);
    };

    const onEnter = () => { inside = true; };
    const onLeave = () => { inside = false; };

    const loop = () => {
      raf = requestAnimationFrame(loop);

      smx += (mx - smx) * 0.08;
      smy += (my - smy) * 0.08;

      const trx = inside ? (smy - 0.5) * -maxTilt * 2 : 0;
      const tryy = inside ? (smx - 0.5) * maxTilt * 2 : 0;
      const ts = inside ? scaleVal : 1;

      rx += (trx - rx) * lerpSpeed;
      ry += (tryy - ry) * lerpSpeed;
      sc += (ts - sc) * lerpSpeed;

      const tbg = inside ? 0.12 : 0;
      bgOpacity += (tbg - bgOpacity) * 0.7;

      // Card itself: only white highlight, no tilt
      card.style.backgroundColor = `rgba(255,255,255,${bgOpacity})`;

      // Publish tilt values as CSS custom properties on the zone
      // so label children can pick them up
      zone.style.setProperty('--tilt-x', `${rx}deg`);
      zone.style.setProperty('--tilt-y', `${ry}deg`);
      zone.style.setProperty('--tilt-scale', `${sc}`);
    };

    const onTouchStart = (e: TouchEvent) => {
      inside = true;
      const t = e.touches[0];
      const r = zone.getBoundingClientRect();
      mx = Math.min(Math.max((t.clientX - r.left) / r.width, 0), 1);
      my = Math.min(Math.max((t.clientY - r.top) / r.height, 0), 1);
    };
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      const r = zone.getBoundingClientRect();
      mx = Math.min(Math.max((t.clientX - r.left) / r.width, 0), 1);
      my = Math.min(Math.max((t.clientY - r.top) / r.height, 0), 1);
    };
    const onTouchEnd = () => { inside = false; };

    zone.addEventListener('mousemove', onMove);
    zone.addEventListener('mouseenter', onEnter);
    zone.addEventListener('mouseleave', onLeave);
    zone.addEventListener('touchstart', onTouchStart, { passive: true });
    zone.addEventListener('touchmove', onTouchMove, { passive: true });
    zone.addEventListener('touchend', onTouchEnd);
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      zone.removeEventListener('mousemove', onMove);
      zone.removeEventListener('mouseenter', onEnter);
      zone.removeEventListener('mouseleave', onLeave);
      zone.removeEventListener('touchstart', onTouchStart);
      zone.removeEventListener('touchmove', onTouchMove);
      zone.removeEventListener('touchend', onTouchEnd);
    };
  }, [zoneRef]);

  return (
    <div
      ref={cardRef}
      className={className}
      style={{
        ...style,
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
      }}
    >
      {children}
    </div>
  );
}
