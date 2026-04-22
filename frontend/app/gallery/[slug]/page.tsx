import {Metadata} from 'next'
import {notFound} from 'next/navigation'
import {sanityFetch} from '@/sanity/lib/live'
import {MosaicGallery, GalleryItem} from '@/app/components/MosaicGallery'

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
    image { asset->{_id, url, metadata{dimensions}}, alt, hotspot, crop },
    video { asset-> },
    videoThumbnail { asset-> },
    description
  }
}`

type Props = {params: Promise<{slug: string}>}

// Derive mosaic size from real image aspect ratio + position in layout
// so the grid always looks balanced regardless of what gets uploaded.
function sizeFromAspect(item: any, idx: number): GalleryItem['size'] {
  const dims = item.image?.asset?.metadata?.dimensions
  if (!dims) {
    // fallback cycle for items with no metadata yet
    const cycle: GalleryItem['size'][] = ['wide','small','small','small','large','small','small','small']
    return cycle[idx % cycle.length]
  }
  const ratio = dims.width / dims.height
  // Very wide landscape (panoramic): span 2 cols, 1 row
  if (ratio > 1.7) return 'wide'
  // Tall portrait: span 1 col, 2 rows
  if (ratio < 0.7) return 'medium'
  // Near-square tall: occasionally go large
  if (ratio < 1.1 && idx % 5 === 0) return 'large'
  // Default: small (1×1)
  return 'small'
}

function toMosaicItems(media: any[]): GalleryItem[] {
  return media.map((item, i) => ({
    _key: item._key,
    type: item.mediaType === 'video' ? 'video' : 'image',
    size: sizeFromAspect(item, i),
    image: item.image,
    video: item.video,
    videoThumbnail: item.videoThumbnail,
    title: item.name,
    description: item.description,
  }))
}

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
      {/* Header */}
      <div className="px-6 pt-20 pb-6">
        <h1 className="text-4xl font-bold text-white tracking-tight">{gallery.title}</h1>
        {gallery.description && (
          <p className="text-zinc-400 mt-2">{gallery.description}</p>
        )}
        {gallery.media?.length > 0 && (
          <p className="text-zinc-600 text-sm mt-1">{gallery.media.length} items</p>
        )}
      </div>

      {/* Mosaic */}
      {gallery.media?.length > 0 ? (
        <MosaicGallery
          items={toMosaicItems(gallery.media)}
          columns={4}
          gap="small"
        />
      ) : (
        <p className="px-6 py-12 text-zinc-500">No media in this gallery yet.</p>
      )}
    </div>
  )
}
