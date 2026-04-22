import {Metadata} from 'next'
import {sanityFetch} from '@/sanity/lib/live'
import {MosaicGallery} from '@/app/components/MosaicGallery'

const GALLERIES_QUERY = `*[_type == "gallery"] | order(publishedAt desc) {
  _id,
  title,
  slug,
  description,
  columns,
  gap,
  showOnHomepage,
  publishedAt,
  items[] {
    _key,
    type,
    size,
    image { asset->, alt },
    video { asset-> },
    videoThumbnail { asset-> },
    title,
    description,
    tags
  }
}`

export const metadata: Metadata = {
  title: 'Gallery — Superhot Fabrication',
  description: 'Portfolio of custom fabrication projects',
}

export default async function GalleryListPage() {
  const {data: galleries} = await sanityFetch({query: GALLERIES_QUERY})

  if (!galleries || galleries.length === 0) {
    return (
      <div className="px-6 py-24">
        <h1 className="text-4xl font-bold mb-4">Gallery</h1>
        <p className="text-zinc-400">No galleries yet — create one in Sanity Studio.</p>
      </div>
    )
  }

  return (
    <div className="py-20">
      {/* Page header */}
      <div className="px-6 mb-16">
        <h1 className="text-5xl font-bold tracking-tight">Gallery</h1>
      </div>

      {/* Galleries — full width, stacked */}
      <div className="space-y-20">
        {galleries.map((gallery: any) => (
          <section key={gallery._id} id={gallery.slug?.current}>
            {/* Section header */}
            <div className="px-6 mb-4">
              <h2 className="text-2xl font-bold">{gallery.title}</h2>
              {gallery.description && (
                <p className="text-zinc-400 mt-1">{gallery.description}</p>
              )}
            </div>

            {/* Full-width mosaic */}
            <MosaicGallery
              items={gallery.items ?? []}
              columns={gallery.columns ?? 3}
              gap={gallery.gap ?? 'small'}
            />
          </section>
        ))}
      </div>
    </div>
  )
}
