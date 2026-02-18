import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import NeuroBackground from './components/NeuroBackground';
import ShimmerText from './components/ShimmerText';
import TiltCard from './components/TiltCard';

export const metadata: Metadata = {
  title: 'Superhot Fabrication — We Construct Your Concepts',
  description: 'We Construct Your Concepts',
};

export default function IndexPage() {
  return (
    <main className="relative w-full bg-black overflow-hidden" style={{ height: '100vh' }}>
      {/* Neural noise WebGL background — warm red/orange/yellow palette */}
      <NeuroBackground blur={16} />

      {/* Radiating lines from center — above tilt cards, below logo */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 4 }}>
        {/* Vertical up — mobile stops at 43%, desktop stops at 53% */}
        <div className="md:hidden" style={{
          position: 'absolute',
          left: 'calc(50% - 0.5px)',
          top: 0,
          width: 1,
          height: '43%',
          background: 'rgba(255,255,255,0.35)',
        }} />
        <div className="hidden md:block" style={{
          position: 'absolute',
          left: 'calc(50% - 0.5px)',
          top: 0,
          width: 1,
          height: '53%',
          background: 'rgba(255,255,255,0.35)',
        }} />
        {/* Down-left diagonal — anchored exactly at clip-path center */}
        <div className="md:hidden" style={{
          position: 'absolute',
          left: 'calc(50% - 0.5px)',
          top: '43%',
          width: 1,
          height: '100vh',
          background: 'rgba(255,255,255,0.35)',
          transformOrigin: '50% 0%',
          transform: 'rotate(-66.4deg)',
        }} />
        <div className="hidden md:block" style={{
          position: 'absolute',
          left: 'calc(50% - 0.5px)',
          top: '53%',
          width: 1,
          height: '100vh',
          background: 'rgba(255,255,255,0.35)',
          transformOrigin: '50% 0%',
          transform: 'rotate(-65deg)',
        }} />
        {/* Down-right diagonal — anchored exactly at clip-path center */}
        <div className="md:hidden" style={{
          position: 'absolute',
          left: 'calc(50% - 0.5px)',
          top: '43%',
          width: 1,
          height: '100vh',
          background: 'rgba(255,255,255,0.35)',
          transformOrigin: '50% 0%',
          transform: 'rotate(66.4deg)',
        }} />
        <div className="hidden md:block" style={{
          position: 'absolute',
          left: 'calc(50% - 0.5px)',
          top: '53%',
          width: 1,
          height: '100vh',
          background: 'rgba(255,255,255,0.35)',
          transformOrigin: '50% 0%',
          transform: 'rotate(65deg)',
        }} />
      </div>

      {/* ── Desktop tilt card sections ── */}
      <div className="hidden md:block absolute inset-0" style={{ zIndex: 3 }}>
        {/* Left section — PROCESS */}
        <div className="absolute inset-0" style={{ clipPath: 'polygon(50% 53%, 50% 0%, 0% 0%, 0% 100%, 19.2% 100%)' }}>
          <TiltCard className="" />
          <Link href="/process" className="absolute inset-0 z-[2] cursor-pointer" />
          <div className="absolute pointer-events-none" style={{ top: 'calc(50% - 150px)', left: 'calc(50% - 370px)', transform: 'perspective(800px) rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg)) scale(var(--tilt-scale, 1))', transformStyle: 'preserve-3d', willChange: 'transform' }}>
            <ShimmerText label="PROCESS" color="yellow" textClassName="text-3xl font-black uppercase tracking-widest drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]" />
          </div>
        </div>
        {/* Right section — GALLERY */}
        <div className="absolute inset-0" style={{ clipPath: 'polygon(50% 53%, 50% 0%, 100% 0%, 100% 100%, 80.8% 100%)' }}>
          <TiltCard className="" />
          <Link href="/gallery" className="absolute inset-0 z-[2] cursor-pointer" />
          <div className="absolute pointer-events-none" style={{ top: 'calc(50% - 150px)', right: 'calc(50% - 370px)', transform: 'perspective(800px) rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg)) scale(var(--tilt-scale, 1))', transformStyle: 'preserve-3d', willChange: 'transform' }}>
            <ShimmerText label="GALLERY" color="orange" textClassName="text-3xl font-black uppercase tracking-widest drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]" />
          </div>
        </div>
        {/* Bottom section — SHOP */}
        <div className="absolute inset-0" style={{ clipPath: 'polygon(50% 53%, 19.2% 100%, 80.8% 100%)' }}>
          <TiltCard className="" />
          <Link href="/shop" className="absolute inset-0 z-[2] cursor-pointer" />
          <div className="absolute pointer-events-none" style={{ top: 'calc(50% + 200px)', left: '50%', transform: 'translateX(-50%) perspective(800px) rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg)) scale(var(--tilt-scale, 1))', transformStyle: 'preserve-3d', willChange: 'transform' }}>
            <ShimmerText label="SHOP" color="red" textClassName="text-3xl font-black uppercase tracking-widest drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]" />
          </div>
        </div>
      </div>

      {/* ── Mobile tilt card sections ── */}
      <div className="md:hidden absolute inset-0" style={{ zIndex: 3 }}>
        {/* Left section — PROCESS */}
        <div className="absolute inset-0" style={{ clipPath: 'polygon(50% 43%, 50% 0%, 0% 0%, 0% 55%)' }}>
          <TiltCard className="" />
          <Link href="/process" className="absolute inset-0 z-[2] cursor-pointer" />
          <div className="absolute pointer-events-none" style={{ top: '30%', left: 16, transform: 'perspective(800px) rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg)) scale(var(--tilt-scale, 1))', transformStyle: 'preserve-3d', willChange: 'transform' }}>
            <ShimmerText label="PROCESS" color="yellow" textClassName="text-2xl font-black uppercase tracking-widest drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]" />
          </div>
        </div>
        {/* Right section — GALLERY */}
        <div className="absolute inset-0" style={{ clipPath: 'polygon(50% 43%, 50% 0%, 100% 0%, 100% 55%)' }}>
          <TiltCard className="" />
          <Link href="/gallery" className="absolute inset-0 z-[2] cursor-pointer" />
          <div className="absolute pointer-events-none" style={{ top: '30%', right: 16, transform: 'perspective(800px) rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg)) scale(var(--tilt-scale, 1))', transformStyle: 'preserve-3d', willChange: 'transform' }}>
            <ShimmerText label="GALLERY" color="orange" textClassName="text-2xl font-black uppercase tracking-widest drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]" />
          </div>
        </div>
        {/* Bottom section — SHOP */}
        <div className="absolute inset-0" style={{ clipPath: 'polygon(50% 43%, 0% 55%, 0% 100%, 100% 100%, 100% 55%)' }}>
          <TiltCard className="" />
          <Link href="/shop" className="absolute inset-0 z-[2] cursor-pointer" />
          <div className="absolute pointer-events-none" style={{ bottom: '30%', left: '50%', transform: 'translateX(-50%) perspective(800px) rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg)) scale(var(--tilt-scale, 1))', transformStyle: 'preserve-3d', willChange: 'transform' }}>
            <ShimmerText label="SHOP" color="red" textClassName="text-2xl font-black uppercase tracking-widest drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]" />
          </div>
        </div>
      </div>

      {/* Centered logo — independent, above tilt cards */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 10 }}>
        <div className="md:hidden -translate-y-16">
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
