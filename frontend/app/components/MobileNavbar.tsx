"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function MobileNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="sticky top-0 z-50 w-full flex items-center justify-between px-4 py-3 bg-black/90 border-b-4 border-yellow-400 shadow-lg backdrop-blur-sm">
      <Link href="/" className="flex items-center gap-2">
        <Image 
          src="/assets/images/superhotfin.png" 
          alt="Superhot Fabrication Logo" 
          width={40} 
          height={40} 
          className="object-contain" 
        />
        <span className="text-lg font-bold bg-gradient-to-r from-[#FFB81C] via-[#FA4616] to-[#FFB81C] bg-clip-text text-transparent tracking-wide">
          SUPERHOT FABRICATION
        </span>
      </Link>

      {/* Hamburger Menu Button */}
      <button
        onClick={toggleMenu}
        className="p-2 text-yellow-400 hover:text-yellow-300 transition-colors"
        aria-label="Toggle menu"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {isMenuOpen ? (
            <>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </>
          ) : (
            <>
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </>
          )}
        </svg>
      </button>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-black/95 border-b-4 border-yellow-400 shadow-lg backdrop-blur-sm">
          <div className="flex flex-col items-center py-4 gap-4">
            <Link
              href="/shop"
              className="text-xl uppercase font-bold bg-gradient-to-r from-[#FFB81C] to-[#FA4616] bg-clip-text text-transparent hover:opacity-80 transition"
              onClick={() => setIsMenuOpen(false)}
            >
              SHOP
            </Link>
            <a
              href="#gallery"
              className="text-xl uppercase font-bold bg-gradient-to-r from-[#FFB81C] to-[#FA4616] bg-clip-text text-transparent hover:opacity-80 transition"
              onClick={() => setIsMenuOpen(false)}
            >
              GALLERY
            </a>
            <a
              href="#process"
              className="text-xl uppercase font-bold bg-gradient-to-r from-[#FFB81C] to-[#FA4616] bg-clip-text text-transparent hover:opacity-80 transition"
              onClick={() => setIsMenuOpen(false)}
            >
              PROCESS
            </a>
            <a
              href="#contact"
              className="text-xl uppercase font-bold bg-gradient-to-r from-[#FFB81C] to-[#FA4616] bg-clip-text text-transparent hover:opacity-80 transition"
              onClick={() => setIsMenuOpen(false)}
            >
              CONTACT
            </a>
          </div>
        </div>
      )}
    </nav>
  );
} 