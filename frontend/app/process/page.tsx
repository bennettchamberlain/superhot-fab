import { Metadata } from 'next';
import { sanityFetch } from '@/sanity/lib/live';
import { allProcessStepsQuery } from '@/sanity/lib/queries';
import InfoSection from '@/app/components/InfoSection';

export const metadata: Metadata = {
  title: 'Process | Superhot Fabrication',
  description: 'How we measure, design, and build your custom fabrication',
};

export default async function ProcessPage() {
  const result = await sanityFetch({
    query: allProcessStepsQuery,
    perspective: 'published',
    stega: false,
  });
  const steps: any[] = Array.isArray(result?.data) ? result.data : [];

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

        {steps.length === 0 ? (
          <p className="text-white/20 text-sm tracking-widest uppercase">No steps found.</p>
        ) : (
          steps.map((step, i) => (
            <div key={step._id} className="w-full">
              {i > 0 && <div className="h-6" />}
              <InfoSection
                title={step.title}
                text={step.body ?? ''}
                videoUrl={step.videoUrl ?? undefined}
                imageUrl={step.imageUrl ?? undefined}
              />
            </div>
          ))
        )}
      </div>

      <footer className="relative z-10 w-full py-6 text-center text-white/20 text-xs tracking-widest uppercase border-t border-white/10 mt-8">
        © {new Date().getFullYear()} Superhot Fabrication
      </footer>
    </main>
  );
}
