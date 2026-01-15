import React from "react";
import Image from "next/image";

interface MobileHeroSectionProps {
  className?: string;
}

export default function MobileHeroSection({ className = "" }: MobileHeroSectionProps) {
  // Symmetrical SVG path for CRT mask (1000x700 viewBox), reduced left/right bulge
  const crtPath =
    "M 100 50 Q 500 -60 900 50 Q 980 350 900 650 Q 500 760 100 650 Q 20 350 100 50 Z";

  return (
    <section className={`w-full min-h-[50vh] flex flex-col items-center justify-center py-4 px-1 relative overflow-visible ${className}`}>
      <div className="relative z-10 w-full max-w-[2000px] mx-auto flex items-center justify-center py-2">
        {/* TV Masked Image with Overlay Content */}
        <div className="relative w-full flex items-center justify-center">
          {/* TV Masked Image with SVG mask */}
          <div
            className="relative flex items-center justify-center"
            style={{ width: "100%", height: "400px", maxWidth: "1300px" }}
          >
            {/* Masked image using SVG mask */}
            <svg
              viewBox="0 0 1000 700"
              width="100%"
              height="100%"
              style={{ position: "absolute", inset: 0, zIndex: 1, overflow: "visible" }}
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
            >
              <defs>
                <clipPath id="crtMaskMobile">
                  <path d={crtPath} />
                </clipPath>
              </defs>
              <image
                href="/assets/images/project1.JPG"
                width="1000"
                height="700"
                clipPath="url(#crtMaskMobile)"
                preserveAspectRatio="xMidYMid slice"
                style={{ filter: "brightness(0.6)" }}
              />
              {/* Black overlay for opacity */}
              <path
                d={crtPath}
                fill="#000"
                opacity="0.4"
                style={{ zIndex: 1 }}
              />
              {/* Yellow border */}
              <path
                d={crtPath}
                stroke="#FACC15"
                strokeWidth="6"
                fill="none"
                style={{ zIndex: 2 }}
              />
            </svg>
            {/* Overlay Content */}
            <div className="absolute inset-0 flex items-center justify-center z-30">
              <div className="flex flex-col items-center gap-4 px-4 w-full justify-center">
                <div className="animate-float flex-shrink-0">
                  <Image
                    src="/assets/images/superhotfin.png"
                    alt="Superhot Fabrication Logo"
                    width={150}
                    height={150}
                    className="object-contain"
                  />
                </div>
                <div className="flex flex-col items-center text-center">
                  <h1 className="text-3xl sm:text-4xl font-extrabold animate-float-slow leading-tight">
                    <span className="bg-gradient-to-r from-[#FFB81C] to-[#FA4616] bg-clip-text text-transparent">
                      SUPERHOT <br /> FABRICATION
                    </span>
                  </h1>
                  <p className="text-lg sm:text-xl text-yellow-400/90 font-light tracking-wider animate-float-slower mt-2">
                    we construct your concepts
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 