import {Metadata} from 'next'
import {notFound} from 'next/navigation'
import {sanityFetch} from '@/sanity/lib/live'
import {MosaicGallery} from '@/app/components/MosaicGallery'
import Link from 'next/link'
import {ChevronLeft} from 'lucide-react'

const GALLERY_QUERY = `*[_type == "gallery" && slug.current == $slug][0] {
  _id,
  title,
  slug,
  description,
  columns,
  gap,
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

type Props = {params: Promise<{slug: string}>}

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {slug} = await params
  const {data: gallery} = await sanityFetch({query: GALLERY_QUERY, params: {slug}})
  if (!gallery) return {title: 'Gallery Not Found'}
  return {
    title: `${gallery.title} — Superhot Fabrication`,
    description: gallery.description ?? `View the ${gallery.title} gallery`,
  }
}

export default async function GalleryPage({params}: Props) {
  const {slug} = await params
  const {data: gallery} = await sanityFetch({query: GALLERY_QUERY, params: {slug}})

  if (!gallery) notFound()

  return (
    <div className="py-20">
      {/* Back + header */}
      <div className="px-6 mb-10">
        <Link
          href="/gallery"
          className="inline-flex items-center gap-1 text-zinc-400 hover:text-white text-sm transition-colors mb-8"
        >
          <ChevronLeft className="w-4 h-4" />
          All galleries
        </Link>

        <h1 className="text-5xl font-bold tracking-tight">{gallery.title}</h1>

        {gallery.description && (
          <p className="text-zinc-400 mt-3 text-lg">{gallery.description}</p>
        )}

        <p className="text-zinc-500 text-sm mt-2">
          {gallery.items?.length ?? 0} items
        </p>
      </div>

      {/* Full-width mosaic */}
      <MosaicGallery
        items={gallery.items ?? []}
        columns={gallery.columns ?? 3}
        gap={gallery.gap ?? 'small'}
      />
    </div>
  )
}
