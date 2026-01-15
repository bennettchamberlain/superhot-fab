"use client";
import React, { useState } from "react";
import { useSwipeable } from "react-swipeable";
//import Image from "next/image";

interface GallerySectionProps {
  images: string[];
  className?: string;
}

const crtPath =
  "M 100 50 Q 500 -60 900 50 Q 980 350 900 650 Q 500 760 100 650 Q 20 350 100 50 Z";

export default function GallerySection({ images, className = "" }: GallerySectionProps) {
  const [current, setCurrent] = useState(0);
  //const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  const prev = () => setCurrent((c) => (c === 0 ? images.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === images.length - 1 ? 0 : c + 1));

  const swipeHandlers = useSwipeable({
    onSwipedLeft: next,
    onSwipedRight: prev,
    preventScrollOnSwipe: true,
    trackMouse: false
  });

  return (
    <section id="gallery" className={`w-full flex flex-col items-center py-16 ${className}`}>
      <h2 className="text-4xl font-bold mb-6 text-large-upper bg-gradient-to-r from-[#FFB81C] to-[#FA4616] bg-clip-text text-transparent">Gallery</h2>
      
      {/* Desktop Gallery */}
      <div className="hidden md:flex relative items-center justify-center w-full max-w-5xl py-6">
        <button
          className="absolute left-4 z-10 bg-black/60 hover:bg-yellow-900/80 transition rounded-full p-3 items-center justify-center"
          onClick={prev}
          aria-label="Previous"
          style={{ boxShadow: "0 2px 8px #0007" }}
        >
          {/* Left Arrow SVG */}
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 8L12 16L20 24" stroke="#FFB81C" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {/* CRT Masked Image */}
        <div className="relative flex items-center justify-center w-[1000px] h-[590px]">
          <svg
            viewBox="0 0 1000 700"
            width="100%"
            height="100%"
            style={{ position: "absolute", inset: 0, zIndex: 1, overflow: "visible" }}
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <defs>
              <clipPath id="crtMaskGallery">
                <path d={crtPath} />
              </clipPath>
            </defs>
            <image
              href={images[current]}
              width="1000"
              height="700"
              clipPath="url(#crtMaskGallery)"
              preserveAspectRatio="xMidYMid meet"
              style={{ filter: "brightness(0.6)" }}
            />
            {/* Yellow border */}
            <path
              d={crtPath}
              stroke="#FACC15"
              strokeWidth="8"
              fill="none"
              style={{ zIndex: 2 }}
            />
          </svg>
        </div>
        <button
          className="absolute right-4 z-10 bg-black/60 hover:bg-yellow-900/80 transition rounded-full p-3 items-center justify-center"
          onClick={next}
          aria-label="Next"
          style={{ boxShadow: "0 2px 8px #0007" }}
        >
          {/* Right Arrow SVG */}
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 8L20 16L12 24" stroke="#FFB81C" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Mobile Gallery */}
      <div className="md:hidden relative flex items-center justify-center w-full max-w-5xl py-6" {...swipeHandlers}>
        <div className="relative flex items-center justify-center w-[350px] h-[210px]">
          <svg
            viewBox="0 0 1000 700"
            width="100%"
            height="100%"
            style={{ position: "absolute", inset: 0, zIndex: 1, overflow: "visible" }}
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <defs>
              <clipPath id="crtMaskGalleryMobile">
                <path d={crtPath} />
              </clipPath>
            </defs>
            <image
              href={images[current]}
              width="1000"
              height="700"
              clipPath="url(#crtMaskGalleryMobile)"
              preserveAspectRatio="xMidYMid meet"
              style={{ filter: "brightness(0.6)" }}
            />
            {/* Yellow border */}
            <path
              d={crtPath}
              stroke="#FACC15"
              strokeWidth="8"
              fill="none"
              style={{ zIndex: 2 }}
            />
          </svg>
        </div>
        {/* Mobile swipe hint */}
        <div className="absolute bottom-[-4rem] left-1/2 -translate-x-1/2 flex gap-2 opacity-80">
          <span className="animate-bounce text-yellow-400">⬅️</span>
          <span className="text-yellow-200">Swipe</span>
          <span className="animate-bounce text-yellow-400">➡️</span>
        </div>
      </div>

      {/* Dots indicator */}
      <div className="flex gap-2 mt-4">
        {images.map((_, idx) => (
          <button
            key={idx}
            className={`w-3 h-3 rounded-full border-2 border-yellow-400 ${current === idx ? "bg-yellow-400" : "bg-black"}`}
            onClick={() => setCurrent(idx)}
            aria-label={`Go to image ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}