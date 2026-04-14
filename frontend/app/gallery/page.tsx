import {Metadata} from 'next'
import {sanityFetch} from '@/sanity/lib/live'
import {MosaicGallery} from '@/app/components/MosaicGallery'

// GROQ query to fetch all galleries
const GALLERIES_QUERY = `*[_type == "gallery"] | order(publishedAt desc) {
  _id,
  title,
  slug,
  description,
  layout,
  columns,
  showOnHomepage,
  publishedAt,
  items[] {
    _key,
    type,
    image {
      asset->,
      alt
    },
    video {
      asset->
    },
    videoThumbnail {
      asset->
    },
    title,
    description,
    tags,
    featured
  }
}`

export const metadata: Metadata = {
  title: 'Gallery - Superhot Fabrication',
  description: 'View our portfolio of custom fabrication projects',
}

export default async function GalleryListPage() {
  const {data: galleries} = await sanityFetch({
    query: GALLERIES_QUERY,
  })

  if (!galleries || galleries.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24">
        <h1 className="text-4xl font-bold mb-8">Gallery</h1>
        <p className="text-gray-400">No galleries found. Create one in Sanity Studio!</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-24">
      <h1 className="text-5xl font-bold mb-4">Gallery</h1>
      <p className="text-xl text-gray-400 mb-16">
        Explore our custom fabrication projects
      </p>

      <div className="space-y-24">
        {galleries.map((gallery: any) => (
          <section key={gallery._id} id={gallery.slug.current} className="scroll-mt-24">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">{gallery.title}</h2>
              {gallery.description && (
                <p className="text-gray-400 text-lg">{gallery.description}</p>
              )}
            </div>

            <MosaicGallery
              items={gallery.items}
              layout={gallery.layout}
              columns={gallery.columns}
            />
          </section>
        ))}
      </div>
    </div>
  )
}
