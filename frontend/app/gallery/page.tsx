import {Metadata} from 'next'
import {sanityFetch} from '@/sanity/lib/live'
import {MosaicGallery, GalleryItem} from '@/app/components/MosaicGallery'

const GALLERIES_QUERY = `*[_type == "gallery"] | order(publishedAt desc) {
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

export const metadata: Metadata = {
  title: 'Gallery — Superhot Fabrication',
  description: 'Portfolio of custom fabrication projects',
}

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

export default async function GalleryListPage() {
  const {data: galleries} = await sanityFetch({query: GALLERIES_QUERY})

  if (!galleries || galleries.length === 0) {
    return (
      <div className="px-6 py-24">
        <h1 className="text-4xl font-bold mb-4">Gallery</h1>
        <p className="text-zinc-400">No galleries yet.</p>
      </div>
    )
  }

  return (
    <div className="bg-black min-h-screen">
      {(galleries as any[]).map((gallery: any) => (
        <section key={gallery._id} className="mb-16">
          <div className="px-6 pt-16 pb-6">
            <h2 className="text-3xl font-bold text-white tracking-tight">{gallery.title}</h2>
            {gallery.description && (
              <p className="text-zinc-400 mt-2">{gallery.description}</p>
            )}
          </div>
          {gallery.media?.length > 0 && (
            <MosaicGallery
              items={toMosaicItems(gallery.media)}
              columns={4}
              gap="small"
            />
          )}
        </section>
      ))}
    </div>
  )
}
