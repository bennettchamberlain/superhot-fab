import { Metadata } from 'next';
import InfoSection from '@/app/components/InfoSection';

export const metadata: Metadata = {
  title: 'Process | Superhot Fabrication',
  description: 'How we measure, design, and build your custom fabrication',
};

export default function ProcessPage() {
  return (
    <main className="min-h-screen w-full font-sans bg-black relative overflow-hidden">
      <div className="relative z-10 w-full flex flex-col items-center pt-28 pb-24 px-4">
        {/* Page heading */}
        <div className="w-full max-w-4xl mb-16">
          <p className="text-xs tracking-[0.4em] uppercase text-white/30 mb-3">How we work</p>
          <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tight text-white leading-none">
            PROCESS
          </h1>
          <div className="mt-6 h-px w-24 bg-white/20" />
        </div>

        <InfoSection
          title="Measure"
          videoUrl="/assets/images/MEASUREFINAL.mp4"
          text={`Full commercial interiors? That closet under the stairs? We make products that fit their spaces.\nWe use 3D scanning to get an exact model of your environment to the millimeter. This makes it easier to plan right, avoid surprises, and create perfect fits. It's fast, accurate, and gives us a solid foundation to start designing.`}
        />
        <div className="h-6" />
        <InfoSection
          title="Design"
          videoUrl="/assets/images/design-2.mov"
          text={`From napkin sketch to polished concept—we work it out together.\nWhether you show up with a photo or just a problem, we'll help shape the idea. We iterate in 3D, show you options, make revisions fast, and never settle for "good enough."\nYou get to see it, move it, tweak it—before anything's built.`}
        />
        <div className="h-6" />
        <InfoSection
          title="Build"
          videoUrl="/assets/images/BUILD.mp4"
          text={`Then we make it for real. No compromises.\nWe build everything in-house—no outsourcing, no dilution.\nWhat you see in the render is what you get in the space.\nClean welds, solid materials, sharp details. Built once, built right.`}
        />
      </div>

      <footer className="relative z-10 w-full py-6 text-center text-white/20 text-xs tracking-widest uppercase border-t border-white/10 mt-8">
        © {new Date().getFullYear()} Superhot Fabrication
      </footer>
    </main>
  );
}
