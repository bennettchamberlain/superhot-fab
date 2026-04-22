import {Metadata} from 'next'
import {sanityFetch} from '@/sanity/lib/live'
import {InfiniteGallery} from '@/app/components/InfiniteGallery'

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
    image { asset->, alt },
    video { asset-> },
    videoThumbnail { asset-> },
    description
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
        <p className="text-zinc-400">No galleries yet.</p>
      </div>
    )
  }

  // Show the first gallery as a full-screen canvas, list others below
  const [primary, ...rest] = galleries as any[]

  return (
    <div>
      {/* Primary gallery — full viewport infinite canvas */}
      <section>
        {primary.media?.length > 0 && (
          <InfiniteGallery items={primary.media} />
        )}
      </section>

      {/* Additional galleries */}
      {rest.length > 0 && (
        <div className="bg-black">
          {rest.map((gallery: any) => (
            <section key={gallery._id} className="py-16">
              <div className="px-6 mb-6">
                <h2 className="text-2xl font-bold text-white">{gallery.title}</h2>
                {gallery.description && (
                  <p className="text-zinc-400 mt-1">{gallery.description}</p>
                )}
              </div>
              {gallery.media?.length > 0 && (
                <div className="h-[70vh]">
                  <InfiniteGallery items={gallery.media} />
                </div>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
