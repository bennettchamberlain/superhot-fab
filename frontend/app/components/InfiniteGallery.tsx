'use client'

import {useState, useRef, useEffect, useCallback, WheelEvent, PointerEvent} from 'react'
import Image from 'next/image'
import {urlForImage} from '@/sanity/lib/utils'
import {X, ChevronLeft, ChevronRight, Play, ZoomIn, ZoomOut} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GalleryMediaItem {
  _key: string
  name?: string
  mediaType: 'image' | 'video'
  image?: {asset: {_ref: string}; alt?: string}
  video?: {asset: {_ref: string; url?: string}}
  videoThumbnail?: {asset: {_ref: string}}
  description?: string
}

interface Props {
  items: GalleryMediaItem[]
}

// ─── Layout constants ─────────────────────────────────────────────────────────

// Each cell on the grid
const CELL_W = 320
const CELL_H = 240
const CELL_GAP = 12

// How many columns (auto-fit based on item count)
function calcCols(count: number): number {
  if (count <= 2) return 2
  if (count <= 6) return 3
  if (count <= 12) return 4
  return 5
}

// ─── Component ────────────────────────────────────────────────────────────────

export function InfiniteGallery({items}: Props) {
  // Camera state — (camX, camY) is the world-space offset, scale is zoom
  const [cam, setCam] = useState({x: 0, y: 0})
  const [scale, setScale] = useState(1)

  // Lightbox
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)

  // Drag state
  const dragging = useRef(false)
  const lastPointer = useRef({x: 0, y: 0})
  const canvasRef = useRef<HTMLDivElement>(null)

  const isLightboxOpen = lightboxIdx !== null
  const currentItem = isLightboxOpen ? items[lightboxIdx] : null

  const COLS = calcCols(items.length)
  const stride = CELL_W + CELL_GAP

  // ── Keyboard nav for lightbox ──
  useEffect(() => {
    if (!isLightboxOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIdx(null)
      if (e.key === 'ArrowRight') setLightboxIdx((i) => i === null ? null : (i + 1) % items.length)
      if (e.key === 'ArrowLeft') setLightboxIdx((i) => i === null ? null : (i - 1 + items.length) % items.length)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isLightboxOpen, items.length])

  // ── Scroll body lock for lightbox ──
  useEffect(() => {
    document.body.style.overflow = isLightboxOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isLightboxOpen])

  // ── Wheel → zoom + pan ──
  const onWheel = useCallback((e: WheelEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (e.ctrlKey || e.metaKey) {
      // Zoom centred on cursor
      const rect = canvasRef.current!.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top
      const delta = -e.deltaY * 0.001
      setScale((s) => {
        const next = Math.min(Math.max(s + delta * s, 0.2), 3)
        const ratio = next / s
        setCam((c) => ({
          x: mx - ratio * (mx - c.x),
          y: my - ratio * (my - c.y),
        }))
        return next
      })
    } else {
      setCam((c) => ({x: c.x - e.deltaX, y: c.y - e.deltaY}))
    }
  }, [])

  // ── Pointer drag to pan ──
  const onPointerDown = useCallback((e: PointerEvent<HTMLDivElement>) => {
    if (isLightboxOpen) return
    // Only pan on the canvas itself, not on item buttons
    if ((e.target as HTMLElement).closest('[data-gallery-item]')) return
    dragging.current = true
    lastPointer.current = {x: e.clientX, y: e.clientY}
    canvasRef.current?.setPointerCapture(e.pointerId)
  }, [isLightboxOpen])

  const onPointerMove = useCallback((e: PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return
    const dx = e.clientX - lastPointer.current.x
    const dy = e.clientY - lastPointer.current.y
    lastPointer.current = {x: e.clientX, y: e.clientY}
    setCam((c) => ({x: c.x + dx, y: c.y + dy}))
  }, [])

  const onPointerUp = useCallback(() => {
    dragging.current = false
  }, [])

  // ── Zoom buttons ──
  const zoomIn = () => setScale((s) => Math.min(s * 1.25, 3))
  const zoomOut = () => setScale((s) => Math.max(s / 1.25, 0.2))
  const resetView = () => { setCam({x: 0, y: 0}); setScale(1) }

  // ── Thumb URL helper ──
  const thumbUrl = (item: GalleryMediaItem): string | null => {
    if (item.mediaType === 'video') {
      const src = item.videoThumbnail ?? item.image
      return src ? urlForImage(src)?.url() ?? null : null
    }
    return item.image ? urlForImage(item.image)?.url() ?? null : null
  }

  return (
    <div className="relative w-full overflow-hidden bg-black" style={{height: '100svh', overscrollBehavior: 'none'}}>

      {/* ── Grid canvas ─────────────────────────────────────────────────── */}
      <div
        ref={canvasRef}
        className="absolute inset-0 cursor-grab active:cursor-grabbing select-none"
        style={{touchAction: 'none'}}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        {/* Dot-grid background */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{
            transform: `translate(${cam.x % (stride * scale)}px, ${cam.y % (stride * scale)}px) scale(1)`,
            transformOrigin: '0 0',
          }}
        >
          <defs>
            <pattern
              id="dot-grid"
              x="0" y="0"
              width={stride * scale}
              height={stride * scale}
              patternUnits="userSpaceOnUse"
            >
              <circle cx={stride * scale / 2} cy={stride * scale / 2} r="1" fill="#333" />
            </pattern>
          </defs>
          <rect width="200%" height="200%" fill="url(#dot-grid)" x="-50%" y="-50%" />
        </svg>

        {/* World transform wrapper */}
        <div
          style={{
            position: 'absolute',
            transform: `translate(${cam.x}px, ${cam.y}px) scale(${scale})`,
            transformOrigin: '0 0',
            // Center the grid initially
            left: 0,
            top: 0,
          }}
        >
          {/* Initial offset to roughly center */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${COLS}, ${CELL_W}px)`,
              gap: `${CELL_GAP}px`,
              padding: `${CELL_GAP}px`,
            }}
          >
            {items.map((item, idx) => {
              const url = thumbUrl(item)
              const isVideo = item.mediaType === 'video'
              return (
                <button
                  key={item._key}
                  data-gallery-item="true"
                  onClick={() => setLightboxIdx(idx)}
                  className="group relative bg-zinc-900 overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  style={{width: CELL_W, height: CELL_H}}
                  aria-label={item.name ?? `Media item ${idx + 1}`}
                >
                  {url ? (
                    <Image
                      src={url}
                      alt={item.image?.alt ?? item.name ?? ''}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes={`${CELL_W}px`}
                      draggable={false}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                      <span className="text-zinc-500 text-sm">No preview</span>
                    </div>
                  )}

                  {/* Video badge */}
                  {isVideo && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-12 h-12 bg-black/60 flex items-center justify-center">
                        <Play className="w-5 h-5 text-white ml-0.5" fill="currentColor" />
                      </div>
                    </div>
                  )}

                  {/* Name strip on hover */}
                  <div className="absolute bottom-0 inset-x-0 bg-black/75 px-2 py-1.5 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
                    <p className="text-white text-xs font-medium truncate">
                      {item.name || (isVideo ? 'Video' : 'Image')}
                    </p>
                  </div>

                  {/* Description dot */}
                  {item.description && (
                    <div className="absolute top-2 right-2 w-4 h-4 bg-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <span className="text-white text-[9px] font-bold">i</span>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── HUD controls ────────────────────────────────────────────────── */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-10">
        <button
          onClick={zoomIn}
          className="w-9 h-9 bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center transition-colors"
          aria-label="Zoom in"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={zoomOut}
          className="w-9 h-9 bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center transition-colors"
          aria-label="Zoom out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={resetView}
          className="w-9 h-9 bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center text-xs font-bold transition-colors"
          aria-label="Reset view"
        >
          1:1
        </button>
      </div>

      {/* Zoom level indicator */}
      <div className="absolute bottom-6 left-6 text-zinc-500 text-xs z-10 pointer-events-none">
        {Math.round(scale * 100)}% · scroll to pan · ctrl+scroll to zoom · drag to pan
      </div>

      {/* ── Lightbox ────────────────────────────────────────────────────── */}
      {isLightboxOpen && currentItem && (
        <div
          className="fixed inset-0 z-50 bg-black/96 flex"
          onClick={() => setLightboxIdx(null)}
          role="dialog"
          aria-modal="true"
        >
          {/* Close */}
          <button
            onClick={() => setLightboxIdx(null)}
            className="absolute top-4 right-4 z-50 w-10 h-10 bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {/* Prev / Next */}
          {items.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setLightboxIdx((i) => i === null ? null : (i - 1 + items.length) % items.length) }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-50 w-10 h-10 bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                aria-label="Previous"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setLightboxIdx((i) => i === null ? null : (i + 1) % items.length) }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-50 w-10 h-10 bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                aria-label="Next"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </>
          )}

          {/* Content */}
          <div className="flex w-full h-full flex-col lg:flex-row" onClick={(e) => e.stopPropagation()}>
            {/* Media */}
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
                    src={urlForImage(currentItem.image)?.url() ?? ''}
                    alt={currentItem.image.alt ?? currentItem.name ?? ''}
                    fill
                    className="object-contain"
                    sizes="(max-width: 1024px) 100vw, 75vw"
                    priority
                  />
                </div>
              ) : null}
            </div>

            {/* Info panel — only if there's content */}
            {(currentItem.name || currentItem.description) && (
              <aside className="lg:w-72 flex-shrink-0 bg-zinc-900 p-8 flex flex-col overflow-y-auto">
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
                <p className="text-zinc-500 text-xs mt-auto pt-6">
                  {lightboxIdx! + 1} / {items.length}
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
    </div>
  )
}
