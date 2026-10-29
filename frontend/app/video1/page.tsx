import type {Metadata} from 'next'

const VIDEO_URL = 'https://spot-anyway-promise-output.trycloudflare.com'

export const metadata: Metadata = {
  title: 'Video',
  description: 'A Superhot Fabrication video.',
}

export default function Video1Page() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-black px-4 py-16 text-white">
      <video
        src={`${VIDEO_URL}/video2.mp4`}
        controls
        playsInline
        className="w-full max-w-5xl bg-black"
      />
      <a
        href={VIDEO_URL}
        className="rounded-full bg-[#DA291C] px-6 py-3 text-sm font-bold uppercase tracking-widest text-white"
      >
        Open video
      </a>
    </main>
  )
}
