'use client';

import { useEffect, useRef } from 'react';

// Determine which section (0=process, 1=gallery, 2=shop, -1=none) the point (mx, my) is in
// using the same clip-path polygons as page.tsx (desktop: center 53%, exits at 19.2%/80.8% bottom)
function getSectionDesktop(mx: number, my: number, W: number, H: number): number {
  const cx = W * 0.5;
  const cy = H * 0.53;

  // PROCESS: left triangle — polygon(50% 53%, 50% 0%, 0% 0%, 0% 100%, 19.2% 100%)
  // point is in process if it's left of the line from center to (0, H) and above or on the left side
  // Simpler: use cross-product / barycentric
  // We test: is point in the left section?
  // Left boundary: vertical line x = W*0.5 (from top to cy)
  // Bottom-left boundary: line from (cx,cy) to (W*0.192, H)
  // Top: y=0, left: x=0

  function cross(ax: number, ay: number, bx: number, by: number, px: number, py: number) {
    return (bx - ax) * (py - ay) - (by - ay) * (px - ax);
  }

  // SHOP: bottom triangle — center(cx,cy) to (W*0.192,H) to (W*0.808,H)
  const shopLeft  = cross(cx, cy, W * 0.192, H, mx, my);
  const shopRight = cross(W * 0.192, H, W * 0.808, H, mx, my);
  const shopClose = cross(W * 0.808, H, cx, cy, mx, my);
  if (shopLeft >= 0 && shopRight >= 0 && shopClose >= 0) return 2; // SHOP

  // PROCESS: left — center(cx,cy) to (cx,0) to (0,0) to (0,H) to (W*0.192,H)
  if (mx < cx) return 0; // PROCESS (left half, excluding shop)

  // GALLERY: right half
  return 1;
}

function getSectionMobile(mx: number, my: number, W: number, H: number): number {
  const cx = W * 0.5;
  const cy = H * 0.5;

  function cross(ax: number, ay: number, bx: number, by: number, px: number, py: number) {
    return (bx - ax) * (py - ay) - (by - ay) * (px - ax);
  }

  // SHOP: center(cx,cy) to (0, H*0.75) to (W, H*0.75)
  const shopLeft  = cross(cx, cy, 0, H * 0.75, mx, my);
  const shopRight = cross(0, H * 0.75, W, H * 0.75, mx, my);
  const shopClose = cross(W, H * 0.75, cx, cy, mx, my);
  if (shopLeft >= 0 && shopRight >= 0 && shopClose >= 0) return 2;

  if (mx < cx) return 0; // PROCESS
  return 1; // GALLERY
}

export default function HomeHoverEffect() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  // per-section lerp state
  const state = useRef([
    { mx: 0.5, my: 0.5, smx: 0.5, smy: 0.5, rx: 0, ry: 0, sc: 1, bgOp: 0, inside: false },
    { mx: 0.5, my: 0.5, smx: 0.5, smy: 0.5, rx: 0, ry: 0, sc: 1, bgOp: 0, inside: false },
    { mx: 0.5, my: 0.5, smx: 0.5, smy: 0.5, rx: 0, ry: 0, sc: 1, bgOp: 0, inside: false },
  ]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    // Query siblings — the data-tiltcard/label elements live in the parent container, not inside this div
    const root = container.parentElement;
    if (!root) return;

    const maxTilt = 32;
    const scaleVal = 1.12;
    const lerpSpeed = 0.06;

    const getSectionId = (i: number) => ['process', 'gallery', 'shop'][i];

    const getEls = (i: number) => {
      const id = getSectionId(i);
      const card = root.querySelector<HTMLElement>(`[data-tiltcard="${id}"]`);
      const label = root.querySelector<HTMLElement>(`[data-tiltlabel="${id}"]`);
      return { card, label };
    };

    const onMove = (clientX: number, clientY: number) => {
      const rect = root.getBoundingClientRect();
      const mx = clientX - rect.left;
      const my = clientY - rect.top;
      const W = rect.width;
      const H = rect.height;

      const isMobile = W < 768;
      const active = isMobile ? getSectionMobile(mx, my, W, H) : getSectionDesktop(mx, my, W, H);

      for (let i = 0; i < 3; i++) {
        const s = state.current[i];
        s.inside = i === active;
        if (s.inside) {
          s.mx = mx / W;
          s.my = my / H;
        }
      }
    };

    const onLeave = () => {
      state.current.forEach(s => { s.inside = false; });
    };

    const loop = () => {
      rafRef.current = requestAnimationFrame(loop);
      for (let i = 0; i < 3; i++) {
        const s = state.current[i];
        s.smx += (s.mx - s.smx) * 0.08;
        s.smy += (s.my - s.smy) * 0.08;

        const trx = s.inside ? (s.smy - 0.5) * -maxTilt * 2 : 0;
        const tryy = s.inside ? (s.smx - 0.5) * maxTilt * 2 : 0;
        const ts = s.inside ? scaleVal : 1;
        const tbg = s.inside ? 0.12 : 0;

        s.rx += (trx - s.rx) * lerpSpeed;
        s.ry += (tryy - s.ry) * lerpSpeed;
        s.sc += (ts - s.sc) * lerpSpeed;
        s.bgOp += (tbg - s.bgOp) * 0.7;

        const { card, label } = getEls(i);
        if (card) card.style.backgroundColor = `rgba(255,255,255,${s.bgOp})`;
        if (label) {
          label.style.transform = `perspective(800px) rotateX(${s.rx}deg) rotateY(${s.ry}deg) scale(${s.sc})`;
        }
      }
    };

    const onMouseMove = (e: MouseEvent) => onMove(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      onMove(t.clientX, t.clientY);
    };

    root.addEventListener('mousemove', onMouseMove);
    root.addEventListener('mouseleave', onLeave);
    root.addEventListener('touchmove', onTouchMove, { passive: true });
    root.addEventListener('touchend', onLeave);
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      root.removeEventListener('mousemove', onMouseMove);
      root.removeEventListener('mouseleave', onLeave);
      root.removeEventListener('touchmove', onTouchMove);
      root.removeEventListener('touchend', onLeave);
    };
  }, []);

  return <div ref={containerRef} className="absolute inset-0 z-[3]" data-home-hover />;
}
