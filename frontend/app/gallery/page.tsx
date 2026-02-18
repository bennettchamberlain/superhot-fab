import { Metadata } from 'next';
import GallerySection from '@/app/components/GallerySection';

export const metadata: Metadata = {
  title: 'Gallery | Superhot Fabrication',
  description: 'See our custom fabrication work',
};

const galleryImages = [
  '/assets/images/Gallery1.JPG',
  '/assets/images/Gallery2.JPG',
  '/assets/images/Gallery3.JPG',
  '/assets/images/Gallery4.JPG',
  '/assets/images/Gallery5.jpg',
  '/assets/images/Gallery6.jpg',
];

export default function GalleryPage() {
  return (
    <main className="min-h-screen w-full font-sans bg-black relative overflow-hidden pt-8">
      {/* Background gradient spots */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        <div className="absolute w-[1000px] h-[1000px] bg-[#FA4616]/[0.04] rounded-full blur-3xl animate-shader-orange -top-60 -left-60" />
        <div className="absolute w-[1200px] h-[1200px] bg-[#FFB81C]/[0.03] rounded-full blur-3xl animate-shader-yellow -bottom-80 right-0" />
        <div className="absolute w-[1100px] h-[1100px] bg-[#DA291C]/[0.03] rounded-full blur-3xl animate-shader-red -left-40 top-1/4" />
      </div>

      <div className="relative z-10 container mx-auto px-4 md:px-8 py-8">
        <GallerySection images={galleryImages} />
      </div>

      <footer className="relative z-10 w-full py-4 text-center text-yellow-400/50 text-sm border-t border-yellow-400/10 mt-8">
        <p>© {new Date().getFullYear()} Superhot Fabrication. All rights reserved.</p>
      </footer>
    </main>
  );
}
