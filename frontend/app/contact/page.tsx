import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact — Superhot Fabrication',
  description: 'Get in touch with Superhot Fabrication.',
};

export default function ContactPage() {
  return (
    <main className="relative min-h-[calc(100vh-80px)] bg-black flex items-center justify-center overflow-hidden px-6">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div
          className="absolute w-[700px] h-[700px] rounded-full blur-3xl opacity-30"
          style={{
            background: 'radial-gradient(circle, #DA291C 0%, transparent 70%)',
            top: '-15%',
            left: '-10%',
          }}
        />
        <div
          className="absolute w-[500px] h-[500px] rounded-full blur-3xl opacity-20"
          style={{
            background: 'radial-gradient(circle, #FFB81C 0%, transparent 70%)',
            bottom: '0%',
            right: '-5%',
          }}
        />
      </div>

      <div className="relative z-10 max-w-lg w-full">
        {/* Heading */}
        <p className="text-xs tracking-[0.4em] uppercase text-white/30 mb-4">Get in touch</p>
        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight text-white leading-none mb-12">
          Contact
        </h1>

        {/* Divider */}
        <div className="w-full h-px bg-white/10 mb-10" />

        {/* Contact details */}
        <div className="space-y-8">
          {/* Email */}
          <div>
            <p className="text-xs tracking-[0.35em] uppercase text-white/30 mb-2">Email</p>
            <a
              href="mailto:help@superhotfab.com"
              className="text-2xl md:text-3xl font-black text-[#FFD000] hover:text-[#FFE033] transition-colors duration-200 break-all"
            >
              help@superhotfab.com
            </a>
          </div>

          {/* Address */}
          <div>
            <p className="text-xs tracking-[0.35em] uppercase text-white/30 mb-2">Studio</p>
            <address className="not-italic text-2xl md:text-3xl font-black text-white leading-snug">
              907 Minna St
              <br />
              San Francisco, CA
            </address>
          </div>
        </div>

        {/* Bottom divider */}
        <div className="w-full h-px bg-white/10 mt-10" />
      </div>
    </main>
  );
}
