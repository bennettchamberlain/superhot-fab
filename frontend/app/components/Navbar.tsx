import Link from "next/link";
import ShimmerText from "./ShimmerText";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 w-full flex items-center justify-between px-6 py-4 bg-black/60 border-b border-white/15 backdrop-blur-sm">
      <ShimmerText
        href="/"
        lines={["SUPERHOT", "FABRICATION"]}
        color="orange"
        className="flex items-center"
        textClassName="text-3xl font-black uppercase leading-none tracking-wider drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]"
      />
      <Link
        href="/contact"
        className="bg-[#FFD000] hover:bg-[#FFE033] active:bg-[#FFBA00] text-black font-black uppercase tracking-widest text-lg px-6 py-2 rounded-none shadow-[0_0_24px_rgba(255,208,0,0.7)] hover:shadow-[0_0_36px_rgba(255,208,0,0.9)] transition-all duration-200"
      >
        CONTACT
      </Link>
    </nav>
  );
}
