'use client';

import { useEffect, useRef } from 'react';

function cross(ax: number, ay: number, bx: number, by: number, px: number, py: number) {
  return (bx - ax) * (py - ay) - (by - ay) * (px - ax);
}

// Two-line test: point is in SHOP if it's on the "inside" of both diagonal lines
// Desktop: lines from center(50%,53%) to (19.2%,100%) and (80.8%,100%)
function getSectionDesktop(mx: number, my: number, W: number, H: number): number {
  const cx = W * 0.5, cy = H * 0.53;
  const lx = W * 0.192, ly = H;   // left exit
  const rx = W * 0.808, ry = H;   // right exit

  // left line: point is right-of (toward shop) when cross <= 0
  const leftSide  = cross(cx, cy, lx, ly, mx, my);
  // right line: point is left-of (toward shop) when cross >= 0
  const rightSide = cross(cx, cy, rx, ry, mx, my);

  if (leftSide <= 0 && rightSide >= 0) return 2; // SHOP
  if (mx <= cx) return 0; // PROCESS
  return 1; // GALLERY
}

// Mobile: lines from center(50%,50%) to (0%,75%) and (100%,75%)
function getSectionMobile(mx: number, my: number, W: number, H: number): number {
  const cx = W * 0.5, cy = H * 0.5;
  const lx = 0,   ly = H * 0.75;
  const rx = W,   ry = H * 0.75;

  const leftSide  = cross(cx, cy, lx, ly, mx, my);
  const rightSide = cross(cx, cy, rx, ry, mx, my);

  if (leftSide <= 0 && rightSide >= 0) return 2; // SHOP
  if (mx <= cx) return 0; // PROCESS
  return 1; // GALLERY
}

export default function HomeHoverEffect() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  const state = useRef([
    { mx: 0.5, my: 0.5, smx: 0.5, smy: 0.5, rx: 0, ry: 0, sc: 1, bgOp: 0, inside: false },
    { mx: 0.5, my: 0.5, smx: 0.5, smy: 0.5, rx: 0, ry: 0, sc: 1, bgOp: 0, inside: false },
    { mx: 0.5, my: 0.5, smx: 0.5, smy: 0.5, rx: 0, ry: 0, sc: 1, bgOp: 0, inside: false },
  ]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const root = container.parentElement;
    if (!root) return;

    const maxTilt = 32, scaleVal = 1.12, lerpSpeed = 0.06;
    const ids = ['process', 'gallery', 'shop'];

    const getEls = (i: number) => ({
      card:  root.querySelector<HTMLElement>(`[data-tiltcard="${ids[i]}"]`),
      label: root.querySelector<HTMLElement>(`[data-tiltlabel="${ids[i]}"]`),
    });

    const onMove = (clientX: number, clientY: number) => {
      const rect = root.getBoundingClientRect();
      const mx = clientX - rect.left, my = clientY - rect.top;
      const W = rect.width, H = rect.height;
      const isMobile = W < 768;
      const active = isMobile ? getSectionMobile(mx, my, W, H) : getSectionDesktop(mx, my, W, H);
      for (let i = 0; i < 3; i++) {
        const s = state.current[i];
        s.inside = i === active;
        if (s.inside) { s.mx = mx / W; s.my = my / H; }
      }
    };

    const onLeave = () => state.current.forEach(s => { s.inside = false; });

    const loop = () => {
      rafRef.current = requestAnimationFrame(loop);
      for (let i = 0; i < 3; i++) {
        const s = state.current[i];
        s.smx += (s.mx - s.smx) * 0.08;
        s.smy += (s.my - s.smy) * 0.08;

        const trx  = s.inside ? (s.smy - 0.5) * -maxTilt * 2 : 0;
        const trry = s.inside ? (s.smx - 0.5) * maxTilt * 2 : 0;
        const ts   = s.inside ? scaleVal : 1;
        const tbg  = s.inside ? 0.12 : 0;

        s.rx   += (trx  - s.rx)   * lerpSpeed;
        s.ry   += (trry - s.ry)   * lerpSpeed;
        s.sc   += (ts   - s.sc)   * lerpSpeed;
        s.bgOp += (tbg  - s.bgOp) * 0.7;

        const { card, label } = getEls(i);
        if (card) card.style.backgroundColor = `rgba(255,255,255,${s.bgOp})`;
        if (label) {
          const centered = label.dataset.tiltlabelCenter === 'true';
          const base = centered ? 'translateX(-50%) ' : '';
          label.style.transform = `${base}perspective(800px) rotateX(${s.rx}deg) rotateY(${s.ry}deg) scale(${s.sc})`;
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => onMove(e.clientX, e.clientY);
    const handleTouchMove = (e: TouchEvent) => { const t = e.touches[0]; onMove(t.clientX, t.clientY); };

    root.addEventListener('mousemove', handleMouseMove);
    root.addEventListener('mouseleave', onLeave);
    root.addEventListener('touchmove', handleTouchMove, { passive: true });
    root.addEventListener('touchend', onLeave);
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      root.removeEventListener('mousemove', handleMouseMove);
      root.removeEventListener('mouseleave', onLeave);
      root.removeEventListener('touchmove', handleTouchMove);
      root.removeEventListener('touchend', onLeave);
    };
  }, []);

  return <div ref={containerRef} className="absolute inset-0" style={{ zIndex: 1 }} />;
}
