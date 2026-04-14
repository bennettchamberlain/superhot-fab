'use client'

import {useState, useEffect} from 'react'
import Image from 'next/image'
import {urlForImage} from '@/sanity/lib/utils'
import {X, ChevronLeft, ChevronRight, Play} from 'lucide-react'

interface GalleryItem {
  _key: string
  type: 'image' | 'video'
  image?: {
    asset: {_ref: string}
    alt?: string
  }
  video?: {
    asset: {_ref: string; url: string}
  }
  videoThumbnail?: {
    asset: {_ref: string}
  }
  title?: string
  description?: string
  tags?: string[]
  featured?: boolean
}

interface MosaicGalleryProps {
  items: GalleryItem[]
  layout?: 'masonry' | 'grid' | 'justified'
  columns?: number
}

export function MosaicGallery({items, layout = 'masonry', columns = 3}: MosaicGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  // Keyboard navigation
  useEffect(() => {
    if (!lightboxOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowLeft') goToPrevious()
      if (e.key === 'ArrowRight') goToNext()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lightboxOpen, currentIndex])

  const openLightbox = (index: number) => {
    setCurrentIndex(index)
    setLightboxOpen(true)
    document.body.style.overflow = 'hidden'
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
    document.body.style.overflow = 'auto'
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length)
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length)
  }

  const currentItem = items[currentIndex]

  // Grid layout classes based on column count
  const gridClass = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
    5: 'md:grid-cols-5',
  }[columns]

  return (
    <>
      {/* Gallery Grid */}
      <div
        className={`grid grid-cols-1 ${gridClass} gap-4 ${
          layout === 'masonry' ? 'auto-rows-auto' : ''
        }`}
      >
        {items.map((item, index) => {
          const isVideo = item.type === 'video'
          const imageUrl = isVideo
            ? item.videoThumbnail
              ? urlForImage(item.videoThumbnail)?.url()
              : item.image
                ? urlForImage(item.image)?.url()
                : null
            : item.image
              ? urlForImage(item.image)?.url()
              : null

          if (!imageUrl) return null

          const spanClass = item.featured ? 'md:col-span-2 md:row-span-2' : ''

          return (
            <button
              key={item._key}
              onClick={() => openLightbox(index)}
              className={`relative group overflow-hidden rounded-lg cursor-pointer bg-gray-900 ${spanClass} ${
                layout === 'masonry' ? 'break-inside-avoid' : 'aspect-square'
              } hover:scale-[1.02] transition-transform duration-300`}
            >
              <Image
                src={imageUrl}
                alt={item.image?.alt || item.title || 'Gallery image'}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                sizes={`(max-width: 768px) 100vw, ${item.featured ? '50vw' : `${100 / columns}vw`}`}
              />
              
              {/* Video play icon overlay */}
              {isVideo && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                  <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                    <Play className="w-8 h-8 text-gray-900 ml-1" fill="currentColor" />
                  </div>
                </div>
              )}

              {/* Title overlay */}
              {item.title && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white font-semibold">{item.title}</p>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Lightbox */}
      {lightboxOpen && currentItem && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-50 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            aria-label="Close lightbox"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Navigation buttons */}
          {items.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 z-50 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 z-50 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </>
          )}

          {/* Main content area */}
          <div className="w-full h-full flex flex-col lg:flex-row items-center justify-center p-4 lg:p-8 gap-8">
            {/* Media */}
            <div className="relative w-full lg:w-2/3 h-[60vh] lg:h-[80vh] flex items-center justify-center">
              {currentItem.type === 'video' && currentItem.video?.asset?.url ? (
                <video
                  src={currentItem.video.asset.url}
                  controls
                  autoPlay
                  className="max-w-full max-h-full rounded-lg"
                />
              ) : currentItem.image ? (
                <Image
                  src={urlForImage(currentItem.image)?.url() || ''}
                  alt={currentItem.image.alt || currentItem.title || 'Gallery image'}
                  fill
                  className="object-contain"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                />
              ) : null}
            </div>

            {/* Info panel */}
            {(currentItem.title || currentItem.description || currentItem.tags) && (
              <div className="w-full lg:w-1/3 max-w-md bg-white/5 backdrop-blur-sm rounded-lg p-6 max-h-[80vh] overflow-y-auto">
                {currentItem.title && (
                  <h3 className="text-2xl font-bold text-white mb-4">{currentItem.title}</h3>
                )}
                
                {currentItem.description && (
                  <p className="text-gray-300 mb-6 whitespace-pre-wrap">{currentItem.description}</p>
                )}

                {currentItem.tags && currentItem.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {currentItem.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-white/10 text-white text-sm rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-6 text-sm text-gray-400">
                  {currentIndex + 1} / {items.length}
                </div>
              </div>
            )}
          </div>

          {/* Keyboard navigation hint */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-gray-400 text-sm">
            Use ← → arrow keys to navigate
          </div>
        </div>
      )}
    </>
  )
}
