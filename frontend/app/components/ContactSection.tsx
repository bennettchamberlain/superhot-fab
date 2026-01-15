export default function ContactSection() {
  return (
    <section id="contact" className="w-full py-6 mb-8 flex flex-col items-center">
      <h2 className="text-3xl font-bold mb-3 text-[#DA291C]">Contact Us</h2>
      <div className="flex flex-col items-center gap-2 bg-black/80 p-4 rounded-2xl border-4 border-[#DA291C] shadow-xl w-full max-w-2xl">
        <a
          href="https://instagram.com/superhotfab"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#FFB81C] to-[#FA4616] text-black font-bold shadow-md hover:scale-105 transition"
        >
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <rect width="20" height="20" x="2" y="2" rx="6" stroke="currentColor" strokeWidth="2" fill="none" />
            <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" fill="none" />
            <circle cx="17" cy="7" r="1.2" fill="currentColor" />
          </svg>
          Instagram
        </a>
        <p className="text-lg text-[#DA291C]">Email: <a href="mailto:help@superhotfab.com" className="underline hover:text-yellow-400">help@superhotfab.com</a></p>
        <p className="text-lg text-[#DA291C]">Phone: <span className="font-mono">(415) 635-7014</span></p>
        <p className="text-lg text-[#DA291C]">Address: <span className="font-mono">907 Minna St. San Francisco, CA 94103</span></p>
      </div>
    </section>
  );
}
// Add tv-mask CSS in globals.css for the bulging square effect. 