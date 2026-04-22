'use client'

import {useState, useEffect, useCallback} from 'react'
import Image from 'next/image'
import {urlForImage} from '@/sanity/lib/utils'
import {X, ChevronLeft, ChevronRight, Play} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GalleryItem {
  _key: string
  type: 'image' | 'video'
  size?: 'small' | 'medium' | 'wide' | 'large'
  image?: {asset: {_ref: string}; alt?: string}
  video?: {asset: {_ref: string; url: string}}
  videoThumbnail?: {asset: {_ref: string}}
  title?: string
  description?: string
  tags?: string[]
}

interface MosaicGalleryProps {
  items: GalleryItem[]
  columns?: number
  gap?: 'none' | 'small' | 'medium' | 'large'
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const GAP_MAP: Record<string, string> = {
  none: 'gap-0',
  small: 'gap-1',
  medium: 'gap-2',
  large: 'gap-4',
}

// Map item size → CSS grid span classes
const SPAN_MAP: Record<string, string> = {
  small:  'col-span-1 row-span-1',
  medium: 'col-span-1 row-span-2',
  wide:   'col-span-2 row-span-1',
  large:  'col-span-2 row-span-2',
}

// Width hints per size — used for responsive srcset sizing
const THUMB_W: Record<string, number> = {small: 600, medium: 600, wide: 1200, large: 1200}

function getThumbUrl(item: GalleryItem): string | null {
  const w = THUMB_W[item.size ?? 'small']
  if (item.type === 'video') {
    const thumb = item.videoThumbnail ?? item.image
    // Use hotspot-aware crop so thumbnail always frames the subject
    return thumb ? urlForImage(thumb)?.width(w).height(Math.round(w * 0.75)).fit('crop').auto('format').url() ?? null : null
  }
  return item.image
    ? urlForImage(item.image)?.width(w).height(Math.round(w * 0.75)).fit('crop').auto('format').url() ?? null
    : null
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MosaicGallery({items, columns = 3, gap = 'small'}: MosaicGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const isOpen = lightboxIndex !== null
  const currentItem = isOpen ? items[lightboxIndex] : null

  // lock scroll when lightbox open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const close = useCallback(() => setLightboxIndex(null), [])
  const prev = useCallback(
    () => setLightboxIndex((i) => (i === null ? null : (i - 1 + items.length) % items.length)),
    [items.length],
  )
  const next = useCallback(
    () => setLightboxIndex((i) => (i === null ? null : (i + 1) % items.length)),
    [items.length],
  )

  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, close, prev, next])

  // Dynamic grid column class
  const colClass: Record<number, string> = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
  }

  return (
    <>
      {/* ── Mosaic grid ───────────────────────────────────────────────────── */}
      <div
        className={`w-full grid auto-rows-[200px] ${colClass[columns] ?? 'grid-cols-3'} ${GAP_MAP[gap] ?? 'gap-1'}`}
      >
        {items.map((item, index) => {
          const thumbUrl = getThumbUrl(item)
          if (!thumbUrl) return null

          const spanClass = SPAN_MAP[item.size ?? 'small'] ?? 'col-span-1 row-span-1'
          const isVideo = item.type === 'video'

          return (
            <button
              key={item._key}
              onClick={() => setLightboxIndex(index)}
              className={`${spanClass} relative group overflow-hidden bg-zinc-900 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white`}
              aria-label={item.title ?? `Gallery item ${index + 1}`}
            >
              <Image
                src={thumbUrl}
                alt={item.image?.alt ?? item.title ?? ''}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes={`(max-width: 768px) 100vw, ${Math.round((100 / columns) * (item.size === 'wide' || item.size === 'large' ? 2 : 1))}vw`}
              />

              {/* video play badge */}
              {isVideo && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-14 h-14 bg-black/60 flex items-center justify-center">
                    <Play className="w-7 h-7 text-white ml-1" fill="currentColor" />
                  </div>
                </div>
              )}

              {/* hover title strip */}
              {item.title && (
                <div className="absolute bottom-0 inset-x-0 bg-black/70 px-3 py-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-white text-sm font-semibold truncate">{item.title}</p>
                </div>
              )}

              {/* details indicator — shown only if there's a description */}
              {item.description && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-[10px] font-bold leading-none">i</span>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* ── Lightbox ──────────────────────────────────────────────────────── */}
      {isOpen && currentItem && (
        <div
          className="fixed inset-0 z-50 bg-black/96 flex"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
        >
          {/* Close */}
          <button
            onClick={close}
            className="absolute top-4 right-4 z-50 w-10 h-10 bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {/* Prev / Next */}
          {items.length > 1 && (
            <>
              <button
                onClick={(e) => {e.stopPropagation(); prev()}}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-50 w-10 h-10 bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                aria-label="Previous"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={(e) => {e.stopPropagation(); next()}}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-50 w-10 h-10 bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                aria-label="Next"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </>
          )}

          {/* Content — stop propagation so clicking the media/panel doesn't close */}
          <div
            className="flex w-full h-full flex-col lg:flex-row"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Media panel */}
            <div className="relative flex-1 flex items-center justify-center p-6 lg:p-12">
              {currentItem.type === 'video' && currentItem.video?.asset?.url ? (
                <video
                  src={currentItem.video.asset.url}
                  controls
                  autoPlay
                  className="max-w-full max-h-full"
                />
              ) : currentItem.image ? (
                <div className="relative w-full h-full">
                  <Image
                    src={urlForImage(currentItem.image)?.url() ?? ''}
                    alt={currentItem.image.alt ?? currentItem.title ?? ''}
                    fill
                    className="object-contain"
                    sizes="(max-width: 1024px) 100vw, 75vw"
                    priority
                  />
                </div>
              ) : null}
            </div>

            {/* Info panel — only renders if there's something to show */}
            {(currentItem.title || currentItem.description || currentItem.tags?.length) && (
              <aside className="lg:w-80 flex-shrink-0 bg-zinc-900 flex flex-col p-8 overflow-y-auto">
                {currentItem.title && (
                  <h2 className="text-xl font-bold text-white mb-4 leading-tight">
                    {currentItem.title}
                  </h2>
                )}

                {currentItem.description && (
                  <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap mb-6">
                    {currentItem.description}
                  </p>
                )}

                {currentItem.tags && currentItem.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-auto">
                    {currentItem.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-white/10 text-white text-xs uppercase tracking-wide"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <p className="text-zinc-500 text-xs mt-6">
                  {lightboxIndex! + 1} / {items.length}
                </p>
              </aside>
            )}
          </div>

          {/* Keyboard hint */}
          <p className="absolute bottom-3 left-1/2 -translate-x-1/2 text-zinc-500 text-xs pointer-events-none">
            ← → navigate · ESC close
          </p>
        </div>
      )}
    </>
  )
}
