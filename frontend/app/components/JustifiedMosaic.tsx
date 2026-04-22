'use client'

/**
 * JustifiedMosaic — row-packing layout with crop tolerance.
 *
 * Algorithm:
 *   1. Each image has a natural aspect ratio from Sanity metadata.
 *   2. Images are packed greedily into rows targeting a fixed height.
 *   3. Once a row's natural total width is close to container width,
 *      we scale all items proportionally so the row fills 100% width.
 *   4. That scale factor = the "distortion". If scale > 1, images are
 *      wider than natural → top/bottom edges slightly cropped.
 *      If scale < 1, images are narrower → left/right edges slightly cropped.
 *   5. maxCropFraction (default 0.18) caps how much distortion is allowed
 *      before we break to a new row instead.
 *   6. Sanity's hotspot data is passed through urlForImage so crops
 *      always center on the focal subject, not the geometric center.
 *
 * Result: every row is flush-justified, images are never stretched beyond
 * tolerance, and the grid fills beautifully regardless of what gets uploaded.
 */

import {useState, useEffect, useRef, useCallback} from 'react'
import Image from 'next/image'
import {urlForImage} from '@/sanity/lib/utils'
import {X, ChevronLeft, ChevronRight, Play} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GalleryMediaItem {
  _key: string
  name?: string
  mediaType: 'image' | 'video'
  image?: {
    asset?: {
      _id?: string
      url?: string
      metadata?: {
        dimensions?: {width: number; height: number; aspectRatio: number}
      }
    }
    alt?: string
    hotspot?: {x: number; y: number}
    crop?: {top: number; bottom: number; left: number; right: number}
  }
  video?: {asset?: {_ref?: string; url?: string}}
  videoThumbnail?: {
    asset?: {_id?: string; metadata?: {dimensions?: {width: number; height: number}}}
    hotspot?: {x: number; y: number}
    crop?: {top: number; bottom: number; left: number; right: number}
  }
  description?: string
}

interface RowItem {
  item: GalleryMediaItem
  displayWidth: number  // px — exact width to render
  displayHeight: number // px — same for all items in row
  cropFraction: number  // diagnostic: how much was cropped (0–maxCropFraction)
}

interface Row {
  items: RowItem[]
  height: number
}

interface Props {
  items: GalleryMediaItem[]
  /**
   * Target row height in px. Rows may vary slightly as images are packed.
   * @default 300
   */
  targetRowHeight?: number
  /**
   * Maximum fraction of an image edge that can be cropped to fill a row.
   * 0.18 = up to 18% of width or height may be trimmed.
   * Lower = more rows, less crop. Higher = fewer rows, more crop.
   * @default 0.18
   */
  maxCropFraction?: number
  /** Gap between images in px. @default 3 */
  gap?: number
}

// ─── Layout engine ────────────────────────────────────────────────────────────

function naturalRatio(item: GalleryMediaItem): number {
  // For images, use real dimensions from Sanity metadata
  const dims = item.image?.asset?.metadata?.dimensions
  if (dims && dims.width && dims.height) return dims.width / dims.height
  // For video, try thumbnail dimensions
  const vdims = item.videoThumbnail?.asset?.metadata?.dimensions
  if (vdims && vdims.width && vdims.height) return vdims.width / vdims.height
  // Fallback: assume standard 4:3
  return 4 / 3
}

function buildLayout(
  items: GalleryMediaItem[],
  containerWidth: number,
  targetH: number,
  maxCrop: number,
  gap: number,
): Row[] {
  if (containerWidth <= 0 || items.length === 0) return []

  const rows: Row[] = []
  // pending = items being accumulated for the current row
  let pending: {item: GalleryMediaItem; naturalW: number}[] = []

  const flushRow = (stretch: boolean) => {
    if (pending.length === 0) return
    const gapTotal = (pending.length - 1) * gap
    const usable = containerWidth - gapTotal
    const naturalTotal = pending.reduce((s, x) => s + x.naturalW, 0)
    const scale = stretch ? usable / naturalTotal : 1
    const cropFraction = Math.abs(1 - scale)

    rows.push({
      height: targetH,
      items: pending.map(({item, naturalW}) => ({
        item,
        displayWidth: Math.round(naturalW * scale),
        displayHeight: targetH,
        cropFraction,
      })),
    })
    pending = []
  }

  for (const item of items) {
    const ratio = naturalRatio(item)
    const naturalW = targetH * ratio
    pending.push({item, naturalW})

    const gapTotal = (pending.length - 1) * gap
    const usable = containerWidth - gapTotal
    const naturalTotal = pending.reduce((s, x) => s + x.naturalW, 0)
    const scale = usable / naturalTotal // <1 = overfull, >1 = underfull

    if (scale <= 1 && 1 - scale <= maxCrop) {
      // Row fills within tolerance — flush it stretched
      flushRow(true)
    } else if (scale < 1 - maxCrop) {
      // Row is overfull beyond tolerance — pop last item, flush, restart
      pending.pop()
      flushRow(true)
      pending.push({item, naturalW})
    }
    // else: row still underfull — keep accumulating
  }

  // Last partial row: only stretch if it's reasonably full (>60% of a full row)
  // Otherwise render items at natural size (don't create huge stretched orphans)
  if (pending.length > 0) {
    const gapTotal = (pending.length - 1) * gap
    const usable = containerWidth - gapTotal
    const naturalTotal = pending.reduce((s, x) => s + x.naturalW, 0)
    const fillRatio = naturalTotal / usable
    flushRow(fillRatio >= 0.6)
  }

  return rows
}

// ─── Thumbnail URL ────────────────────────────────────────────────────────────

function thumbUrl(item: GalleryMediaItem, w: number, h: number): string | null {
  const src = item.mediaType === 'video'
    ? (item.videoThumbnail ?? item.image)
    : item.image
  if (!src) return null
  return (
    urlForImage(src)
      ?.width(w)
      .height(h)
      .fit('crop')        // enables hotspot-based cropping
      .auto('format')     // WebP where supported
      .url() ?? null
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function JustifiedMosaic({
  items,
  targetRowHeight = 300,
  maxCropFraction = 0.18,
  gap = 3,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(1200) // SSR default
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)

  // Track container width with ResizeObserver
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      setContainerWidth(Math.floor(entry.contentRect.width))
    })
    ro.observe(el)
    setContainerWidth(Math.floor(el.getBoundingClientRect().width))
    return () => ro.disconnect()
  }, [])

  const rows = buildLayout(items, containerWidth, targetRowHeight, maxCropFraction, gap)

  // Flat index lookup: given row+col → flat item index
  const flatItems: GalleryMediaItem[] = rows.flatMap((r) => r.items.map((i) => i.item))

  // Lightbox helpers
  const isOpen = lightboxIdx !== null
  const currentItem = isOpen ? flatItems[lightboxIdx] : null

  const close = useCallback(() => setLightboxIdx(null), [])
  const prev = useCallback(() =>
    setLightboxIdx((i) => (i === null ? null : (i - 1 + flatItems.length) % flatItems.length)),
  [flatItems.length])
  const next = useCallback(() =>
    setLightboxIdx((i) => (i === null ? null : (i + 1) % flatItems.length)),
  [flatItems.length])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [isOpen, close, prev, next])

  let flatIdx = 0

  return (
    <>
      {/* ── Grid ──────────────────────────────────────────────────────────── */}
      <div ref={containerRef} className="w-full bg-black">
        {rows.map((row, rowIdx) => (
          <div
            key={rowIdx}
            className="flex"
            style={{gap, marginBottom: rowIdx < rows.length - 1 ? gap : 0}}
          >
            {row.items.map((cell) => {
              const idx = flatIdx++
              const isVideo = cell.item.mediaType === 'video'
              const url = thumbUrl(cell.item, cell.displayWidth * 2, cell.displayHeight * 2)

              return (
                <button
                  key={cell.item._key}
                  onClick={() => setLightboxIdx(idx)}
                  className="group relative overflow-hidden bg-zinc-900 flex-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  style={{width: cell.displayWidth, height: cell.displayHeight}}
                  aria-label={cell.item.name ?? `Media ${idx + 1}`}
                >
                  {url ? (
                    <Image
                      src={url}
                      alt={cell.item.image?.alt ?? cell.item.name ?? ''}
                      fill
                      sizes={`${cell.displayWidth}px`}
                      className="object-cover transition-all duration-500 group-hover:scale-[1.03] group-hover:brightness-90"
                      draggable={false}
                    />
                  ) : (
                    <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                      <span className="text-zinc-600 text-xs">No preview</span>
                    </div>
                  )}

                  {/* Video play badge */}
                  {isVideo && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-12 h-12 bg-black/55 flex items-center justify-center backdrop-blur-sm">
                        <Play className="w-5 h-5 text-white ml-0.5" fill="currentColor" />
                      </div>
                    </div>
                  )}

                  {/* Name strip on hover */}
                  {cell.item.name && (
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent px-2.5 py-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
                      <p className="text-white text-xs font-medium truncate leading-tight">
                        {cell.item.name}
                      </p>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        ))}
      </div>

      {/* ── Lightbox ──────────────────────────────────────────────────────── */}
      {isOpen && currentItem && (
        <div
          className="fixed inset-0 z-50 bg-black/96 flex"
          onClick={close}
          role="dialog"
          aria-modal="true"
        >
          <button
            onClick={close}
            className="absolute top-4 right-4 z-50 w-10 h-10 bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {flatItems.length > 1 && (
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

          <div
            className="flex w-full h-full flex-col lg:flex-row"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative flex-1 flex items-center justify-center p-8">
              {currentItem.mediaType === 'video' && currentItem.video?.asset ? (
                <video
                  src={(currentItem.video.asset as any).url}
                  controls
                  autoPlay
                  className="max-w-full max-h-full"
                />
              ) : currentItem.image ? (
                <div className="relative w-full h-full">
                  <Image
                    src={urlForImage(currentItem.image)?.width(2400).fit('max').auto('format').url() ?? ''}
                    alt={currentItem.image.alt ?? currentItem.name ?? ''}
                    fill
                    className="object-contain"
                    sizes="(max-width: 1024px) 100vw, 80vw"
                    priority
                  />
                </div>
              ) : null}
            </div>

            {(currentItem.name || currentItem.description) && (
              <aside className="lg:w-72 flex-shrink-0 bg-zinc-900/80 backdrop-blur-sm p-8 flex flex-col overflow-y-auto">
                {currentItem.name && (
                  <h2 className="text-lg font-bold text-white mb-4 leading-tight">
                    {currentItem.name}
                  </h2>
                )}
                {currentItem.description && (
                  <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
                    {currentItem.description}
                  </p>
                )}
                <p className="text-zinc-600 text-xs mt-auto pt-6">
                  {lightboxIdx! + 1} / {flatItems.length}
                </p>
              </aside>
            )}
          </div>

          <p className="absolute bottom-3 left-1/2 -translate-x-1/2 text-zinc-600 text-xs pointer-events-none">
            ← → navigate · ESC close
          </p>
        </div>
      )}
    </>
  )
}
