import { Metadata } from 'next';
import InfoSection from '@/app/components/InfoSection';

export const metadata: Metadata = {
  title: 'Process | Superhot Fabrication',
  description: 'How we measure, design, and build your custom fabrication',
};

export default function ProcessPage() {
  return (
    <main className="min-h-screen w-full font-sans bg-black relative overflow-hidden">
      {/* Background gradient spots */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        <div className="absolute w-[1000px] h-[1000px] bg-[#FFB81C]/[0.04] rounded-full blur-3xl animate-shader-yellow -top-60 -left-60" />
        <div className="absolute w-[1200px] h-[1200px] bg-[#FA4616]/[0.03] rounded-full blur-3xl animate-shader-orange -bottom-80 right-0" />
        <div className="absolute w-[1100px] h-[1100px] bg-[#DA291C]/[0.03] rounded-full blur-3xl animate-shader-red -left-40 top-1/4" />
      </div>

      <div className="relative z-10 w-full flex flex-col items-center py-16">
        <h1 className="text-5xl md:text-6xl font-bold mb-12 text-large-upper bg-gradient-to-r from-[#FFB81C] to-[#FA4616] bg-clip-text text-transparent">
          Process
        </h1>

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

      <footer className="relative z-10 w-full py-4 text-center text-yellow-400/50 text-sm border-t border-yellow-400/10 mt-8">
        <p>© {new Date().getFullYear()} Superhot Fabrication. All rights reserved.</p>
      </footer>
    </main>
  );
}
