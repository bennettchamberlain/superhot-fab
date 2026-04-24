import {Metadata} from 'next'
import {sanityFetch} from '@/sanity/lib/live'
import {CanvasMosaic} from '@/app/components/CanvasMosaic'

const GALLERIES_QUERY = `*[_type == "gallery" && slug.current == "fabrication-portfolio"][0] {
  _id,
  title,
  slug,
  description,
  publishedAt,
  media[] {
    _key,
    name,
    mediaType,
    image {
      asset->{ _id, _ref, url, metadata{ dimensions } },
      alt,
      hotspot,
      crop
    },
    video { asset-> },
    videoThumbnail {
      asset->{ _id, _ref, metadata{ dimensions } },
      hotspot,
      crop
    },
    description
  }
}`

export const metadata: Metadata = {
  title: 'Gallery — Superhot Fabrication',
  description: 'Portfolio of custom fabrication projects',
}

export default async function GalleryListPage() {
  const {data: gallery} = await sanityFetch({query: GALLERIES_QUERY})

  if (!gallery || !(gallery as any).media?.length) {
    return (
      <div className="px-6 py-24">
        <h1 className="text-4xl font-bold mb-4">Gallery</h1>
        <p className="text-zinc-400">No galleries yet.</p>
      </div>
    )
  }

  const g = gallery as any

  return (
    <div className="bg-black min-h-screen">
      <div className="px-6 pt-16 pb-6">
        <h1 className="text-3xl font-bold text-white tracking-tight">{g.title}</h1>
        {g.description && (
          <p className="text-zinc-400 mt-2">{g.description}</p>
        )}
      </div>
      <CanvasMosaic
        items={g.media}
        targetRowHeight={320}
        maxCropFraction={0.18}
        gap={8}
      />
    </div>
  )
}
