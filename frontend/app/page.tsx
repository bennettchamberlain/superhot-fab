import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import ShimmerText from './components/ShimmerText';
import TiltCard from './components/TiltCard';

export const metadata: Metadata = {
  title: 'Superhot Fabrication — We Construct Your Concepts',
  description: 'We Construct Your Concepts',
};

export default function IndexPage() {
  return (
    <main className="relative w-full bg-black overflow-hidden text-white" style={{ height: '100svh', minHeight: '-webkit-fill-available' }}>

      {/* Radiating lines from center — aligned with clip-path triangle edges */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 4 }}>
        {/* ─── DESKTOP LINES ─── */}
        {/* Vertical up — from center (50%, 53%) to top */}
        <div className="hidden md:block" style={{
          position: 'absolute',
          left: 'calc(50% - 0.5px)',
          top: 0,
          width: 1,
          height: '53%',
          background: 'rgba(255,255,255,0.35)',
        }} />
        
        {/* Down-left diagonal — from center (50%, 53%) to bottom-left corner (19.2%, 100%) */}
        {/* Angle: atan2(47, -30.8) ≈ -56.8° from vertical down */}
        <div className="hidden md:block" style={{
          position: 'absolute',
          left: 'calc(50% - 0.5px)',
          top: '53%',
          width: 1,
          height: '150vh', // long enough to reach corner
          background: 'rgba(255,255,255,0.35)',
          transformOrigin: '50% 0%',
          transform: 'rotate(-56.8deg)',
        }} />
        
        {/* Down-right diagonal — from center (50%, 53%) to bottom-right corner (80.8%, 100%) */}
        {/* Angle: atan2(47, 30.8) ≈ 56.8° from vertical down */}
        <div className="hidden md:block" style={{
          position: 'absolute',
          left: 'calc(50% - 0.5px)',
          top: '53%',
          width: 1,
          height: '150vh',
          background: 'rgba(255,255,255,0.35)',
          transformOrigin: '50% 0%',
          transform: 'rotate(56.8deg)',
        }} />

        {/* ─── MOBILE LINES ─── */}
        {/* Vertical up — from center (50%, 50%) to top */}
        <div className="md:hidden" style={{
          position: 'absolute',
          left: 'calc(50% - 0.5px)',
          top: 0,
          width: 1,
          height: '50%',
          background: 'rgba(255,255,255,0.35)',
        }} />
        
        {/* Down-left — 120° sector: from (50%,50%) to (0%,63%) */}
        {/* angle from vertical = atan2(13, 50) ≈ 30° → rotate(-30°) */}
        <div className="md:hidden" style={{
          position: 'absolute',
          left: 'calc(50% - 0.5px)',
          top: '50%',
          width: 1,
          height: '150vh',
          background: 'rgba(255,255,255,0.35)',
          transformOrigin: '50% 0%',
          transform: 'rotate(-30deg)',
        }} />
        
        {/* Down-right — 120° sector: from (50%,50%) to (100%,63%) */}
        <div className="md:hidden" style={{
          position: 'absolute',
          left: 'calc(50% - 0.5px)',
          top: '50%',
          width: 1,
          height: '150vh',
          background: 'rgba(255,255,255,0.35)',
          transformOrigin: '50% 0%',
          transform: 'rotate(30deg)',
        }} />
      </div>

      {/* ── Desktop tilt card sections ── */}
      <div className="hidden md:block absolute inset-0" style={{ zIndex: 3 }}>
        {/* Left section — PROCESS — perfect triangle left side */}
        <div className="absolute inset-0" style={{ clipPath: 'polygon(50% 53%, 50% 0%, 0% 0%, 0% 100%, 19.2% 100%, 50% 53%)' }}>
          <TiltCard className="" />
          <Link href="/process" className="absolute inset-0 z-[2] cursor-pointer" />
          <div className="absolute pointer-events-none" style={{ top: 'calc(50% - 150px)', left: 'calc(50% - 370px)', transform: 'perspective(800px) rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg)) scale(var(--tilt-scale, 1))', transformStyle: 'preserve-3d', willChange: 'transform' }}>
            <ShimmerText label="PROCESS" color="white" textClassName="text-3xl font-black uppercase tracking-widest drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]" />
          </div>
        </div>
        {/* Right section — GALLERY — perfect triangle right side */}
        <div className="absolute inset-0" style={{ clipPath: 'polygon(50% 53%, 50% 0%, 100% 0%, 100% 100%, 80.8% 100%, 50% 53%)' }}>
          <TiltCard className="" />
          <Link href="/gallery" className="absolute inset-0 z-[2] cursor-pointer" />
          <div className="absolute pointer-events-none" style={{ top: 'calc(50% - 150px)', right: 'calc(50% - 370px)', transform: 'perspective(800px) rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg)) scale(var(--tilt-scale, 1))', transformStyle: 'preserve-3d', willChange: 'transform' }}>
            <ShimmerText label="GALLERY" color="white" textClassName="text-3xl font-black uppercase tracking-widest drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]" />
          </div>
        </div>
        {/* Bottom section — SHOP — perfect triangle bottom */}
        <div className="absolute inset-0" style={{ clipPath: 'polygon(50% 53%, 19.2% 100%, 80.8% 100%, 50% 53%)' }}>
          <TiltCard className="" />
          <Link href="/shop" className="absolute inset-0 z-[2] cursor-pointer" />
          <div className="absolute pointer-events-none" style={{ top: 'calc(50% + 200px)', left: '50%', transform: 'translateX(-50%) perspective(800px) rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg)) scale(var(--tilt-scale, 1))', transformStyle: 'preserve-3d', willChange: 'transform' }}>
            <ShimmerText label="SHOP" color="white" textClassName="text-3xl font-black uppercase tracking-widest drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]" />
          </div>
        </div>
      </div>

      {/* ── Mobile tilt card sections ── */}
      <div className="md:hidden absolute inset-0" style={{ zIndex: 3 }}>
        {/* Left section — PROCESS */}
        <div className="absolute inset-0" style={{ clipPath: 'polygon(50% 50%, 50% 0%, 0% 0%, 0% 63%, 50% 50%)' }}>
          <TiltCard className="" />
          <Link href="/process" className="absolute inset-0 z-[2] cursor-pointer" />
          <div className="absolute pointer-events-none" style={{ top: '28%', left: 20, transform: 'perspective(800px) rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg)) scale(var(--tilt-scale, 1))', transformStyle: 'preserve-3d', willChange: 'transform' }}>
            <ShimmerText label="PROCESS" color="white" textClassName="text-2xl font-black uppercase tracking-widest drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]" />
          </div>
        </div>
        {/* Right section — GALLERY */}
        <div className="absolute inset-0" style={{ clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 63%, 50% 50%)' }}>
          <TiltCard className="" />
          <Link href="/gallery" className="absolute inset-0 z-[2] cursor-pointer" />
          <div className="absolute pointer-events-none" style={{ top: '28%', right: 20, transform: 'perspective(800px) rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg)) scale(var(--tilt-scale, 1))', transformStyle: 'preserve-3d', willChange: 'transform' }}>
            <ShimmerText label="GALLERY" color="white" textClassName="text-2xl font-black uppercase tracking-widest drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]" />
          </div>
        </div>
        {/* Bottom section — SHOP */}
        <div className="absolute inset-0" style={{ clipPath: 'polygon(50% 50%, 0% 63%, 0% 100%, 100% 100%, 100% 63%, 50% 50%)' }}>
          <TiltCard className="" />
          <Link href="/shop" className="absolute inset-0 z-[2] cursor-pointer" />
          <div className="absolute pointer-events-none" style={{ bottom: '20%', left: '50%', transform: 'translateX(-50%) perspective(800px) rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg)) scale(var(--tilt-scale, 1))', transformStyle: 'preserve-3d', willChange: 'transform' }}>
            <ShimmerText label="SHOP" color="white" textClassName="text-2xl font-black uppercase tracking-widest drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]" />
          </div>
        </div>
      </div>

      {/* Centered logo — independent, above tilt cards */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 10 }}>
        <div className="md:hidden">
          <Image
            src="/assets/images/superhotfin.png"
            alt="Superhot Fabrication Logo"
            width={80}
            height={80}
            className="object-contain drop-shadow-[0_0_32px_rgba(255,184,28,0.4)] animate-float"
            priority
          />
        </div>
        <div className="hidden md:block">
          <Image
            src="/assets/images/superhotfin.png"
            alt="Superhot Fabrication Logo"
            width={200}
            height={200}
            className="object-contain drop-shadow-[0_0_40px_rgba(255,184,28,0.4)] animate-float"
            priority
          />
        </div>
      </div>

      {/* Tagline bottom-center */}
      <p className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-sm tracking-[0.3em] uppercase text-white/30 font-light">
        We Construct Your Concepts
      </p>
    </main>
  );
}
