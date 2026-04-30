import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import ShimmerText from './components/ShimmerText';
import HomeHoverEffect from './components/HomeHoverEffect';

export const metadata: Metadata = {
  title: 'Superhot Fabrication — We Construct Your Concepts',
  description: 'We Construct Your Concepts',
};

export default function IndexPage() {
  return (
    <main className="relative w-full bg-black overflow-hidden text-white" style={{ height: '100svh', minHeight: '-webkit-fill-available' }}>

      {/* Radiating lines — SVG with exact same % coords as clip-paths */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 4 }}>
        {/* DESKTOP: center (50%,53%), exits at (19.2%,100%) and (80.8%,100%) */}
        <svg className="hidden md:block absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
          <line x1="50" y1="53" x2="50"  y2="0"   stroke="rgba(255,255,255,0.7)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <line x1="50" y1="53" x2="19.2" y2="100" stroke="rgba(255,255,255,0.7)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <line x1="50" y1="53" x2="80.8" y2="100" stroke="rgba(255,255,255,0.7)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        </svg>
        {/* MOBILE: center (50%,50%), exits at (0%,75%) and (100%,75%) */}
        <svg className="md:hidden absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
          <line x1="50" y1="50" x2="50"  y2="0"   stroke="rgba(255,255,255,0.7)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <line x1="50" y1="50" x2="0"   y2="75"  stroke="rgba(255,255,255,0.7)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <line x1="50" y1="50" x2="100" y2="75"  stroke="rgba(255,255,255,0.7)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>

      {/* ── Desktop tilt card sections ── */}
      {/* ── Desktop sections ── */}
      <div className="hidden md:block absolute inset-0" style={{ zIndex: 3 }}>
        {/* PROCESS */}
        <div className="absolute inset-0">
          <div data-tiltcard="process" className="absolute inset-0 pointer-events-none" style={{ clipPath: 'polygon(50% 53%, 50% 0%, 0% 0%, 0% 100%, 19.2% 100%, 50% 53%)' }} />
          <div data-tiltlabel="process" className="absolute pointer-events-none" style={{ top: 'calc(50% - 150px)', left: 'calc(50% - 370px)', willChange: 'transform' }}>
            <ShimmerText label="PROCESS" color="white" textClassName="text-3xl font-black uppercase tracking-widest drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]" />
          </div>
        </div>
        {/* GALLERY */}
        <div className="absolute inset-0">
          <div data-tiltcard="gallery" className="absolute inset-0 pointer-events-none" style={{ clipPath: 'polygon(50% 53%, 50% 0%, 100% 0%, 100% 100%, 80.8% 100%, 50% 53%)' }} />
          <div data-tiltlabel="gallery" className="absolute pointer-events-none" style={{ top: 'calc(50% - 150px)', right: 'calc(50% - 370px)', willChange: 'transform' }}>
            <ShimmerText label="GALLERY" color="white" textClassName="text-3xl font-black uppercase tracking-widest drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]" />
          </div>
        </div>
        {/* SHOP */}
        <div className="absolute inset-0">
          <div data-tiltcard="shop" className="absolute inset-0 pointer-events-none" style={{ clipPath: 'polygon(50% 53%, 19.2% 100%, 80.8% 100%, 50% 53%)' }} />
          <div data-tiltlabel="shop" data-tiltlabel-center="true" className="absolute pointer-events-none" style={{ top: 'calc(50% + 200px)', left: '50%', transform: 'translateX(-50%)', willChange: 'transform' }}>
            <ShimmerText label="SHOP" color="white" textClassName="text-3xl font-black uppercase tracking-widest drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]" />
          </div>
        </div>
        {/* Nav links — on top of everything, clipped so only triangle is clickable */}
        <Link href="/process" className="absolute inset-0 block" style={{ clipPath: 'polygon(50% 53%, 50% 0%, 0% 0%, 0% 100%, 19.2% 100%, 50% 53%)', zIndex: 2 }} />
        <Link href="/gallery" className="absolute inset-0 block" style={{ clipPath: 'polygon(50% 53%, 50% 0%, 100% 0%, 100% 100%, 80.8% 100%, 50% 53%)', zIndex: 2 }} />
        <Link href="/shop" className="absolute inset-0 block" style={{ clipPath: 'polygon(50% 53%, 19.2% 100%, 80.8% 100%, 50% 53%)', zIndex: 2 }} />
        {/* Single mouse tracker — sits above cards, below nav links */}
        <HomeHoverEffect />
      </div>

      {/* ── Mobile sections ── */}
      <div className="md:hidden absolute inset-0" style={{ zIndex: 3 }}>
        {/* PROCESS */}
        <div className="absolute inset-0">
          <div data-tiltcard="process" className="absolute inset-0 pointer-events-none" style={{ clipPath: 'polygon(50% 50%, 50% 0%, 0% 0%, 0% 75%, 50% 50%)' }} />
          <div data-tiltlabel="process" className="absolute pointer-events-none" style={{ top: '28%', left: 20, willChange: 'transform' }}>
            <ShimmerText label="PROCESS" color="white" textClassName="text-2xl font-black uppercase tracking-widest drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]" />
          </div>
        </div>
        {/* GALLERY */}
        <div className="absolute inset-0">
          <div data-tiltcard="gallery" className="absolute inset-0 pointer-events-none" style={{ clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 75%, 50% 50%)' }} />
          <div data-tiltlabel="gallery" className="absolute pointer-events-none" style={{ top: '28%', right: 20, willChange: 'transform' }}>
            <ShimmerText label="GALLERY" color="white" textClassName="text-2xl font-black uppercase tracking-widest drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]" />
          </div>
        </div>
        {/* SHOP */}
        <div className="absolute inset-0">
          <div data-tiltcard="shop" className="absolute inset-0 pointer-events-none" style={{ clipPath: 'polygon(50% 50%, 0% 75%, 0% 100%, 100% 100%, 100% 75%, 50% 50%)' }} />
          <div data-tiltlabel="shop" data-tiltlabel-center="true" className="absolute pointer-events-none" style={{ bottom: '20%', left: '50%', transform: 'translateX(-50%)', willChange: 'transform' }}>
            <ShimmerText label="SHOP" color="white" textClassName="text-2xl font-black uppercase tracking-widest drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]" />
          </div>
        </div>
        {/* Nav links */}
        <Link href="/process" className="absolute inset-0 block" style={{ clipPath: 'polygon(50% 50%, 50% 0%, 0% 0%, 0% 75%, 50% 50%)', zIndex: 2 }} />
        <Link href="/gallery" className="absolute inset-0 block" style={{ clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 75%, 50% 50%)', zIndex: 2 }} />
        <Link href="/shop" className="absolute inset-0 block" style={{ clipPath: 'polygon(50% 50%, 0% 75%, 0% 100%, 100% 100%, 100% 75%, 50% 50%)', zIndex: 2 }} />
        <HomeHoverEffect />
      </div>

      {/* Centered logo — independent, above tilt cards */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 10 }}>
        <div className="md:hidden" style={{ marginBottom: 'calc(3% - 2px)' }}>
          <Image
            src="/assets/images/superhotfin.png"
            alt="Superhot Fabrication Logo"
            width={80}
            height={80}
            className="object-contain drop-shadow-[0_0_32px_rgba(255,184,28,0.4)] animate-float"
            priority
          />
        </div>
        <div className="hidden md:block" style={{ marginTop: '21px' }}>
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
