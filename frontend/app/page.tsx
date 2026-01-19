import { Metadata } from 'next';
//import Link from "next/link";
//import { type Post } from "./components/types";
import HeroSection from "./components/HeroSection";
import MobileHeroSection from "./components/MobileHeroSection";
import GallerySection from "./components/GallerySection";
//import PostsSection from "./components/PostsSection";
import ContactSection from "./components/ContactSection";
import InfoSection from "./components/InfoSection";
import AboutSection from "./components/AboutSection";

//import { client } from "@/sanity/client";

//const POSTS_QUERY = `*[
//  _type == "post"
//  && defined(slug.current)
//]|order(publishedAt desc)[0...12]{_id, title, slug, publishedAt, image, body}`;

//const options = { next: { revalidate: 30 } };

export const metadata: Metadata = {
  title: 'Superhot Fabrication - We Construct Your Concepts',
  description: 'Custom fabrication and metalworking services. From 3D scanning and precision measurement to collaborative design and expert manufacturing. We construct your concepts with quality craftsmanship.',
  alternates: {
    canonical: 'https://superhotfab.com',
  },
  openGraph: {
    title: 'Superhot Fabrication - We Construct Your Concepts',
    description: 'Custom fabrication and metalworking services. From 3D scanning and precision measurement to collaborative design and expert manufacturing.',
    url: 'https://superhotfab.com',
    siteName: 'Superhot Fabrication',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Superhot Fabrication - We Construct Your Concepts',
    description: 'Custom fabrication and metalworking services. From 3D scanning and precision measurement to collaborative design and expert manufacturing.',
  },
  keywords: ['custom fabrication', 'metalworking', '3D scanning', 'custom design', 'manufacturing', 'welding', 'metal fabrication'],
};

export default async function IndexPage() {
  //const posts = await client.fetch<Post[]>(POSTS_QUERY, {}, options);
  // Placeholder gallery images
  const galleryImages = [
    "/assets/images/Gallery1.JPG",
    "/assets/images/Gallery2.JPG",
    "/assets/images/Gallery3.JPG",
    "/assets/images/Gallery4.JPG",
    "/assets/images/Gallery5.jpg",
    "/assets/images/Gallery6.jpg",
  ];

  // Structured data for Organization/LocalBusiness
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Superhot Fabrication",
    "description": "Custom fabrication and metalworking services. We construct your concepts with precision measurement, 3D design, and expert manufacturing.",
    "url": "https://superhotfab.com",
    "priceRange": "$$",
  };

  return (
    <main className="min-h-screen w-full font-sans bg-black relative overflow-hidden">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(structuredData)}}
      />
      {/* Gradient spots */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Yellow spots */}
        <div className="absolute w-[1000px] h-[1000px] bg-[#FFB81C]/[0.03] rounded-full blur-3xl animate-float-slow -top-60 -left-60" />
        <div className="absolute w-[800px] h-[800px] bg-[#FFB81C]/[0.02] rounded-full blur-3xl animate-float-slower top-1/3 left-1/4" />
        
        {/* Orange spots */}
        <div className="absolute w-[1200px] h-[1200px] bg-[#FA4616]/[0.03] rounded-full blur-3xl animate-float -bottom-80 right-0" />
        <div className="absolute w-[900px] h-[900px] bg-[#FA4616]/[0.02] rounded-full blur-3xl animate-float-slow top-1/2 -right-40" />
        
        {/* Red spots */}
        <div className="absolute w-[1100px] h-[1100px] bg-[#DA291C]/[0.03] rounded-full blur-3xl animate-float-slower -left-40 top-1/4" />
        <div className="absolute w-[700px] h-[700px] bg-[#DA291C]/[0.02] rounded-full blur-3xl animate-float bottom-1/4 left-1/3" />
        
        {/* Mixed color spots */}
        <div className="absolute w-[1300px] h-[1300px] bg-gradient-to-br from-[#FFB81C]/[0.02] via-[#FA4616]/[0.02] to-[#DA291C]/[0.02] rounded-full blur-3xl animate-float-slow -top-40 right-1/4" />
        <div className="absolute w-[950px] h-[950px] bg-gradient-to-tr from-[#DA291C]/[0.02] via-[#FA4616]/[0.02] to-[#FFB81C]/[0.02] rounded-full blur-3xl animate-float-slower bottom-1/3 -right-20" />
      </div>

      <div className="w-full">
        {/* Responsive Hero Section */}
        <div className="hidden md:block">
          <HeroSection className="tv-slide-in-left" />
        </div>
        <div className="block md:hidden">
          <MobileHeroSection className="tv-slide-in-left" />
        </div>
        <AboutSection className="tv-slide-in-right" />
        <section id="process" className="w-full flex flex-col items-center py-16">
          <h2 className="text-4xl font-bold mb-10 text-large-upper bg-gradient-to-r from-[#FFB81C] to-[#FA4616] bg-clip-text text-transparent">Process</h2>
          <InfoSection
            title="Measure"
            videoUrl="/assets/images/MEASUREFINAL.mp4"
            text="Full commercial interiors? That closet under the stairs? We make products that fit their spaces.
We use 3D scanning to get an exact model of your environment to the millimeter. This makes it easier to plan right, avoid surprises, and create perfect fits. It&apos;s fast, accurate, and gives us a solid foundation to start designing."
          />
          <div className="h-6" />
          <InfoSection
            title="Design"
            videoUrl="/assets/images/design-2.mov"
            text="From napkin sketch to polished concept—we work it out together.
Whether you show up with a photo or just a problem, we&apos;ll help shape the idea. We iterate in 3D, show you options, make revisions fast, and never settle for &quot;good enough.&quot;  
You get to see it, move it, tweak it—before anything&apos;s built."
          />
          <div className="h-6" />
          <InfoSection
            title="Build"
            videoUrl="/assets/images/BUILD.mp4"
            text="Then we make it for real. No compromises.
 We build everything in-house—no outsourcing, no dilution.
 What you see in the render is what you get in the space.
 Clean welds, solid materials, sharp details. Built once, built right."
          />
        </section>
        <GallerySection images={galleryImages} className="tv-slide-in-right" />
        <div className="max-w-4xl mx-auto px-2 md:px-8">
          <ContactSection />
        </div>
      </div>
      {/* Copyright Footer */}
      <footer className="w-full py-4 text-center text-yellow-400/80 text-sm border-t border-yellow-400/20">
        <p>© {new Date().getFullYear()} Superhot Fabrication. All rights reserved.</p>
      </footer>
    </main>
  );
}
