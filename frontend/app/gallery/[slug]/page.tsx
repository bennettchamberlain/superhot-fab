import {Metadata} from 'next'
import {notFound} from 'next/navigation'
import {sanityFetch} from '@/sanity/lib/live'
import {MosaicGallery} from '@/app/components/MosaicGallery'
import Link from 'next/link'
import {ChevronLeft} from 'lucide-react'

// GROQ query to fetch a single gallery
const GALLERY_QUERY = `*[_type == "gallery" && slug.current == $slug][0] {
  _id,
  title,
  slug,
  description,
  layout,
  columns,
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

type Props = {
  params: Promise<{slug: string}>
}

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {slug} = await params
  const {data: gallery} = await sanityFetch({
    query: GALLERY_QUERY,
    params: {slug},
  })

  if (!gallery) {
    return {
      title: 'Gallery Not Found',
    }
  }

  return {
    title: `${gallery.title} - Superhot Fabrication`,
    description: gallery.description || `View ${gallery.title} gallery`,
  }
}

export default async function GalleryPage({params}: Props) {
  const {slug} = await params
  const {data: gallery} = await sanityFetch({
    query: GALLERY_QUERY,
    params: {slug},
  })

  if (!gallery) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-24">
      {/* Back button */}
      <Link
        href="/gallery"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
        Back to Galleries
      </Link>

      {/* Gallery header */}
      <div className="mb-12">
        <h1 className="text-5xl font-bold mb-4">{gallery.title}</h1>
        {gallery.description && (
          <p className="text-xl text-gray-400">{gallery.description}</p>
        )}
        <div className="mt-4 text-sm text-gray-500">
          {gallery.items.length} item{gallery.items.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Gallery grid */}
      <MosaicGallery
        items={gallery.items}
        layout={gallery.layout}
        columns={gallery.columns}
      />
    </div>
  )
}
