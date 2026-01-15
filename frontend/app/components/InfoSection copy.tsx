import React from "react";

interface InfoSectionProps {
  imageUrl?: string;
  videoUrl?: string;
  title: string;
  text: string;
}

const crtPath =
  "M 100 50 Q 500 -60 900 50 Q 980 350 900 650 Q 500 760 100 650 Q 20 350 100 50 Z";

export default function InfoSection({ imageUrl, videoUrl, title, text }: InfoSectionProps) {
  return (
    <section className="w-full flex flex-col md:flex-row items-center justify-center py-12 px-4 md:px-12 gap-8 md:gap-16 max-w-4xl mx-auto min-h-[540px] md:min-h-[480px] max-h-[700px] md:max-h-[600px] mb-16">
      {/* CRT Image (if present) */}
      {imageUrl && (
        <div className="flex-shrink-0 w-full max-w-[400px] h-[320px] md:w-[400px] md:h-[320px] mb-6 md:mb-0">
          <svg
            viewBox="0 0 1000 700"
            width="100%"
            height="100%"
            style={{ display: "block", overflow: "visible" }}
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <defs>
              <clipPath id="crtMaskInfo">
                <path d={crtPath} />
              </clipPath>
            </defs>
            <image
              href={imageUrl}
              width="1000"
              height="700"
              clipPath="url(#crtMaskInfo)"
              preserveAspectRatio="none"
              style={{ filter: "brightness(0.6)" }}
            />
            {/* Black overlay for opacity */}
            <path
              d={crtPath}
              fill="#000"
              opacity="0.4"
            />
            {/* Yellow border */}
            <path
              d={crtPath}
              stroke="#FACC15"
              strokeWidth="8"
              fill="none"
            />
          </svg>
        </div>
      )}
      {/* Text Content */}
      <div className="flex-1 flex flex-col items-start justify-center w-full max-w-2xl min-h-[320px] md:min-h-[320px]">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-4 bg-gradient-to-r from-[#FFB81C] to-[#FA4616] bg-clip-text text-transparent">
          {title}
        </h2>
        <p className="text-lg md:text-xl text-yellow-100 mb-6 whitespace-pre-line">{text}</p>
        {/* Video (if present) */}
        {videoUrl && (
          <div className="w-full mt-4">
            <video
              src={videoUrl}
              controls
              muted
              autoPlay
              loop
              playsInline
              className="w-full rounded-lg border-4 border-yellow-400 shadow-lg max-h-[320px] md:max-h-[340px] object-contain"
              style={{ background: "#000" }}
            />
          </div>
        )}
      </div>
    </section>
  );
}
