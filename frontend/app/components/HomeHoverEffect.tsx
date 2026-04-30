'use client';

import { useEffect, useRef } from 'react';

function cross(ax: number, ay: number, bx: number, by: number, px: number, py: number) {
  return (bx - ax) * (py - ay) - (by - ay) * (px - ax);
}

// Returns 0=process, 1=gallery, 2=shop
// Desktop: center at 53%, dividing lines exit at 19.2% and 80.8% bottom
function getSectionDesktop(mx: number, my: number, W: number, H: number): number {
  const cx = W * 0.5, cy = H * 0.53;
  // SHOP triangle vertices (CCW winding): (cx,cy) → (W*0.808,H) → (W*0.192,H)
  // Point is inside when all cross products are <= 0
  const c1 = cross(cx, cy, W * 0.808, H, mx, my);
  const c2 = cross(W * 0.808, H, W * 0.192, H, mx, my);
  const c3 = cross(W * 0.192, H, cx, cy, mx, my);
  if (c1 <= 0 && c2 <= 0 && c3 <= 0) return 2; // SHOP
  if (mx <= cx) return 0; // PROCESS (left half above shop)
  return 1; // GALLERY
}

// Mobile: center at 50%, dividing lines exit at 75% height
function getSectionMobile(mx: number, my: number, W: number, H: number): number {
  const cx = W * 0.5, cy = H * 0.5;
  // SHOP triangle: (cx,cy) → (W, H*0.75) → (0, H*0.75) — CCW
  const c1 = cross(cx, cy, W, H * 0.75, mx, my);
  const c2 = cross(W, H * 0.75, 0, H * 0.75, mx, my);
  const c3 = cross(0, H * 0.75, cx, cy, mx, my);
  if (c1 <= 0 && c2 <= 0 && c3 <= 0) return 2; // SHOP
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

        const trx = s.inside ? (s.smy - 0.5) * -maxTilt * 2 : 0;
        const trry = s.inside ? (s.smx - 0.5) * maxTilt * 2 : 0;
        const ts = s.inside ? scaleVal : 1;
        const tbg = s.inside ? 0.12 : 0;

        s.rx += (trx - s.rx) * lerpSpeed;
        s.ry += (trry - s.ry) * lerpSpeed;
        s.sc += (ts - s.sc) * lerpSpeed;
        s.bgOp += (tbg - s.bgOp) * 0.7;

        const { card, label } = getEls(i);
        if (card) card.style.backgroundColor = `rgba(255,255,255,${s.bgOp})`;
        if (label) {
          // SHOP label needs translateX(-50%) preserved (it's centered via left:50%)
          const centered = label.dataset.tiltlabelCenter === 'true';
          const base = centered ? 'translateX(-50%) ' : '';
          label.style.transform = `${base}perspective(800px) rotateX(${s.rx}deg) rotateY(${s.ry}deg) scale(${s.sc})`;
        }
      }
    };

    root.addEventListener('mousemove', (e: MouseEvent) => onMove(e.clientX, e.clientY));
    root.addEventListener('mouseleave', onLeave);
    root.addEventListener('touchmove', (e: TouchEvent) => { const t = e.touches[0]; onMove(t.clientX, t.clientY); }, { passive: true });
    root.addEventListener('touchend', onLeave);
    rafRef.current = requestAnimationFrame(loop);

    return () => { cancelAnimationFrame(rafRef.current); };
  }, []);

  return <div ref={containerRef} className="absolute inset-0" style={{ zIndex: 1 }} data-home-hover />;
}
