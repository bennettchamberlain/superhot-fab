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
    image { asset->, alt },
    video { asset-> },
    videoThumbnail { asset-> },
    description
  }
}`

type Props = {params: Promise<{slug: string}>}

// Cycle through sizes to create a natural mosaic rhythm
const MOSAIC_SIZES: GalleryItem['size'][] = [
  'wide', 'small', 'small',
  'small', 'large', 'small',
  'small', 'small', 'wide',
  'medium', 'small', 'small',
  'small', 'wide', 'small',
  'large', 'small', 'small',
]

function toMosaicItems(media: any[]): GalleryItem[] {
  return media.map((item, i) => ({
    _key: item._key,
    type: item.mediaType === 'video' ? 'video' : 'image',
    size: MOSAIC_SIZES[i % MOSAIC_SIZES.length],
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
