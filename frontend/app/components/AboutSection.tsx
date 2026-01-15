interface AboutSectionProps {
  className?: string;
}

export default function AboutSection({ className = "" }: AboutSectionProps) {
  return (
    <section id="about" className={`w-full py-16 px-4 md:px-8 ${className}`}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-[#FFB81C] to-[#FA4616] bg-clip-text text-transparent">
            We Solve Problems
          </h2>
          <p className="text-lg md:text-xl text-yellow-100 leading-relaxed">
            Got a weird idea? A unique problem? No one&apos;s willing to help? We&apos;ll push through all and any obstacles to build you something beautiful and functional. From one-off showpieces, to pimpin&apos; build-outs, we make real what other shops won&apos;t quote. We love challenges.
          </p>
        </div>
        
        <div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-[#FFB81C] to-[#FA4616] bg-clip-text text-transparent">
            Design-Build Solutions
          </h2>
          <p className="text-lg md:text-xl text-yellow-100 leading-relaxed">
            Measure. Design. Build. We eliminate bureaucracy by being a one-stop shop. No middlemen. No uncertainties. We handle all steps of your project under one roof to deliver consistent and seamless results.
          </p>
        </div>
      </div>
    </section>
  );
} 