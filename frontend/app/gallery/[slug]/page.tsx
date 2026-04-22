import {Metadata} from 'next'
import {notFound} from 'next/navigation'
import {sanityFetch} from '@/sanity/lib/live'
import {CanvasMosaic} from '@/app/components/CanvasMosaic'

const GALLERY_QUERY = `*[_type == "gallery" && slug.current == $slug][0] {
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
      asset->{ _id, url, metadata{ dimensions } },
      alt,
      hotspot,
      crop
    },
    video { asset-> },
    videoThumbnail {
      asset->{ _id, metadata{ dimensions } },
      hotspot,
      crop
    },
    description
  }
}`

type Props = {params: Promise<{slug: string}>}

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {slug} = await params
  const {data: gallery} = await sanityFetch({query: GALLERY_QUERY, params: {slug}})
  if (!gallery) return {title: 'Gallery Not Found'}
  return {
    title: `${gallery.title} — Superhot Fabrication`,
    description: gallery.description ?? `${gallery.title} gallery`,
  }
}

export default async function GalleryPage({params}: Props) {
  const {slug} = await params
  const {data: gallery} = await sanityFetch({query: GALLERY_QUERY, params: {slug}})

  if (!gallery) notFound()

  return (
    <div className="bg-black min-h-screen">
      <div className="px-6 pt-20 pb-6">
        <h1 className="text-4xl font-bold text-white tracking-tight">{gallery.title}</h1>
        {gallery.description && (
          <p className="text-zinc-400 mt-2">{gallery.description}</p>
        )}
        {gallery.media?.length > 0 && (
          <p className="text-zinc-600 text-sm mt-1">{gallery.media.length} items</p>
        )}
      </div>

      {gallery.media?.length > 0 ? (
        <CanvasMosaic
          items={gallery.media}
          targetRowHeight={320}
          maxCropFraction={0.18}
          gap={3}
        />
      ) : (
        <p className="px-6 py-12 text-zinc-500">No media in this gallery yet.</p>
      )}
    </div>
  )
}
