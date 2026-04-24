'use client'

/**
 * CanvasMosaic — true masonry (column-based, natural image heights) inside a
 * pannable / zoomable / pinchable infinite canvas.
 *
 * Layout: items placed into N columns, each column grows independently.
 * Images keep their natural aspect ratio — no uniform row height.
 * Title is rendered as the first element on the canvas itself.
 */

import {
  useState, useRef, useEffect, useCallback,
  WheelEvent, PointerEvent as ReactPointerEvent, TouchEvent,
} from 'react'
import Image from 'next/image'
import {urlForImage} from '@/sanity/lib/utils'
import {X, ChevronLeft, ChevronRight, Play, ZoomIn, ZoomOut} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GalleryMediaItem {
  _key: string
  name?: string
  mediaType: 'image' | 'video'
  image?: {
    asset?: {_id?: string; url?: string; metadata?: {dimensions?: {width: number; height: number}}}
    alt?: string
    hotspot?: {x: number; y: number}
    crop?: {top: number; bottom: number; left: number; right: number}
  }
  video?: {asset?: {url?: string}}
  videoThumbnail?: {
    asset?: {_id?: string; metadata?: {dimensions?: {width: number; height: number}}}
    hotspot?: {x: number; y: number}
    crop?: {top: number; bottom: number; left: number; right: number}
  }
  description?: string
}

interface MasonryCell {
  item: GalleryMediaItem
  x: number
  y: number
  w: number
  h: number
  index: number
}

interface Props {
  items: GalleryMediaItem[]
  title?: string
  description?: string
  columns?: number
  colWidth?: number
  gap?: number
}

// ─── Image URL helper ─────────────────────────────────────────────────────────
function sanityImageSrc(
  img: GalleryMediaItem['image'] | GalleryMediaItem['videoThumbnail'] | undefined,
): GalleryMediaItem['image'] | null {
  if (!img?.asset) return null
  const asset = img.asset as Record<string, unknown>
  if (!asset._ref && asset._id) asset._ref = asset._id
  return img as GalleryMediaItem['image']
}

// ─── Natural aspect ratio ─────────────────────────────────────────────────────
function naturalRatio(item: GalleryMediaItem): number {
  const d = item.image?.asset?.metadata?.dimensions
  if (d?.width && d?.height) return d.width / d.height
  const v = item.videoThumbnail?.asset?.metadata?.dimensions
  if (v?.width && v?.height) return v.width / v.height
  return 4 / 3
}

// ─── Masonry layout engine ────────────────────────────────────────────────────
// Places items into `numCols` columns of equal width.
// Each item gets its natural height (width / aspect).
// Shortest column always gets the next item.
function buildMasonry(
  items: GalleryMediaItem[],
  numCols: number,
  colW: number,
  gap: number,
  topOffset: number, // space for title above the grid
): {cells: MasonryCell[]; totalHeight: number; canvasW: number} {
  const canvasW = numCols * colW + (numCols - 1) * gap
  const colHeights = new Array<number>(numCols).fill(topOffset)

  const cells: MasonryCell[] = items.map((item, index) => {
    // Pick shortest column
    const col = colHeights.indexOf(Math.min(...colHeights))
    const x = col * (colW + gap)
    const y = colHeights[col]
    const h = Math.round(colW / naturalRatio(item))
    colHeights[col] += h + gap
    return {item, x, y, w: colW, h, index}
  })

  return {cells, totalHeight: Math.max(...colHeights), canvasW}
}

// ─── Physics constants ────────────────────────────────────────────────────────
const DRAG_DAMPING = 0.65
const FRICTION     = 0.88
const ZOOM_MIN     = 0.18
const ZOOM_MAX     = 3.5
const TILT_MAX_DEG = 6

// ─── Component ────────────────────────────────────────────────────────────────

export function CanvasMosaic({
  items,
  title,
  description,
  columns = 4,
  colWidth = 520,
  gap = 12,
}: Props) {
  const wrapRef   = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const rafRef    = useRef<number>(0)
  const velRef    = useRef({x: 0, y: 0})
  const camRef    = useRef({x: 0, y: 0})
  const scaleRef  = useRef(1)
  const dragging  = useRef(false)
  const lastPtr   = useRef({x: 0, y: 0})
  const pinchRef  = useRef<{dist: number; midX: number; midY: number} | null>(null)

  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)

  // Title block height on canvas (rough estimate; exact size handled by CSS)
  const TITLE_H = title ? 160 : 40

  const {cells, totalHeight, canvasW} = buildMasonry(items, columns, colWidth, gap, TITLE_H)

  // ── DOM transform (no React re-render per frame) ──────────────────────────
  const applyTransform = useCallback(() => {
    const el = canvasRef.current
    if (!el) return
    const s = scaleRef.current
    const {x, y} = camRef.current
    const tilt = TILT_MAX_DEG * Math.max(0, 1 - (s - ZOOM_MIN) / (ZOOM_MAX - ZOOM_MIN))
    el.style.transform = `perspective(1600px) rotateX(${tilt}deg) translate(${x}px, ${y}px) scale(${s})`
  }, [])

  // ── Inertia loop ───────────────────────────────────────────────────────────
  const tick = useCallback(() => {
    const {x: vx, y: vy} = velRef.current
    if (Math.abs(vx) < 0.1 && Math.abs(vy) < 0.1) { velRef.current = {x: 0, y: 0}; return }
    camRef.current = {x: camRef.current.x + vx, y: camRef.current.y + vy}
    velRef.current = {x: vx * FRICTION, y: vy * FRICTION}
    applyTransform()
    rafRef.current = requestAnimationFrame(tick)
  }, [applyTransform])

  // ── Pointer drag ───────────────────────────────────────────────────────────
  const onPointerDown = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    if (lightboxIdx !== null) return
    if ((e.target as HTMLElement).closest('[data-item]')) return
    dragging.current = true
    lastPtr.current = {x: e.clientX, y: e.clientY}
    cancelAnimationFrame(rafRef.current)
    velRef.current = {x: 0, y: 0}
    wrapRef.current?.setPointerCapture(e.pointerId)
  }, [lightboxIdx])

  const onPointerMove = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return
    const dx = (e.clientX - lastPtr.current.x) * DRAG_DAMPING
    const dy = (e.clientY - lastPtr.current.y) * DRAG_DAMPING
    lastPtr.current = {x: e.clientX, y: e.clientY}
    velRef.current = {x: dx, y: dy}
    camRef.current = {x: camRef.current.x + dx, y: camRef.current.y + dy}
    applyTransform()
  }, [applyTransform])

  const onPointerUp = useCallback(() => {
    if (!dragging.current) return
    dragging.current = false
    rafRef.current = requestAnimationFrame(tick)
  }, [tick])

  // ── Wheel zoom / pan ───────────────────────────────────────────────────────
  const onWheel = useCallback((e: WheelEvent<HTMLDivElement>) => {
    e.preventDefault()
    const rect = wrapRef.current!.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    if (e.ctrlKey || e.metaKey || Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      const delta = -e.deltaY * (e.ctrlKey || e.metaKey ? 0.008 : 0.002)
      const prev = scaleRef.current
      const next = Math.min(Math.max(prev + delta * prev, ZOOM_MIN), ZOOM_MAX)
      const ratio = next / prev
      camRef.current = {x: mx - ratio * (mx - camRef.current.x), y: my - ratio * (my - camRef.current.y)}
      scaleRef.current = next
    } else {
      camRef.current = {x: camRef.current.x - e.deltaX * DRAG_DAMPING, y: camRef.current.y - e.deltaY * DRAG_DAMPING}
    }
    applyTransform()
  }, [applyTransform])

  // ── Pinch zoom ─────────────────────────────────────────────────────────────
  const onTouchStart = useCallback((e: TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      const [a, b] = [e.touches[0], e.touches[1]]
      pinchRef.current = {dist: Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY), midX: (a.clientX + b.clientX) / 2, midY: (a.clientY + b.clientY) / 2}
    }
  }, [])

  const onTouchMove = useCallback((e: TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2 && pinchRef.current) {
      e.preventDefault()
      const [a, b] = [e.touches[0], e.touches[1]]
      const dist = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY)
      const midX = (a.clientX + b.clientX) / 2
      const midY = (a.clientY + b.clientY) / 2
      const rect = wrapRef.current!.getBoundingClientRect()
      const mx = midX - rect.left
      const my = midY - rect.top
      const ratio = dist / pinchRef.current.dist
      const prev = scaleRef.current
      const next = Math.min(Math.max(prev * ratio, ZOOM_MIN), ZOOM_MAX)
      const sr = next / prev
      camRef.current = {x: mx - sr * (mx - camRef.current.x) + (midX - pinchRef.current.midX), y: my - sr * (my - camRef.current.y) + (midY - pinchRef.current.midY)}
      scaleRef.current = next
      pinchRef.current = {dist, midX, midY}
      applyTransform()
    }
  }, [applyTransform])

  const onTouchEnd = useCallback(() => { pinchRef.current = null }, [])

  // ── Double-click zoom ──────────────────────────────────────────────────────
  const onDoubleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('[data-item]')) return
    const rect = wrapRef.current!.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    const prev = scaleRef.current
    const next = prev >= 1.8 ? 1 : Math.min(prev * 2, ZOOM_MAX)
    const ratio = next / prev
    camRef.current = {x: mx - ratio * (mx - camRef.current.x), y: my - ratio * (my - camRef.current.y)}
    scaleRef.current = next
    applyTransform()
  }, [applyTransform])

  // ── HUD buttons ───────────────────────────────────────────────────────────
  const zoomIn   = () => { scaleRef.current = Math.min(scaleRef.current * 1.3, ZOOM_MAX); applyTransform() }
  const zoomOut  = () => { scaleRef.current = Math.max(scaleRef.current / 1.3, ZOOM_MIN); applyTransform() }
  const resetView = () => { camRef.current = {x: 0, y: 0}; scaleRef.current = 1; applyTransform() }

  useEffect(() => {
    // On mobile, auto-fit the canvas to the viewport width on mount
    if (wrapRef.current) {
      const vpW = wrapRef.current.clientWidth
      if (vpW < canvasW) {
        scaleRef.current = vpW / canvasW
      }
    }
    applyTransform()
  }, [applyTransform, canvasW])
  useEffect(() => () => cancelAnimationFrame(rafRef.current), [])

  // ── Lightbox ───────────────────────────────────────────────────────────────
  const flatItems = cells.map(c => c.item)
  const isOpen = lightboxIdx !== null
  const currentItem = isOpen ? flatItems[lightboxIdx] : null
  const close = useCallback(() => setLightboxIdx(null), [])
  const prev  = useCallback(() => setLightboxIdx(i => i === null ? null : (i - 1 + flatItems.length) % flatItems.length), [flatItems.length])
  const nextL = useCallback(() => setLightboxIdx(i => i === null ? null : (i + 1) % flatItems.length), [flatItems.length])

  useEffect(() => { document.body.style.overflow = isOpen ? 'hidden' : ''; return () => { document.body.style.overflow = '' } }, [isOpen])
  useEffect(() => {
    if (!isOpen) return
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); if (e.key === 'ArrowLeft') prev(); if (e.key === 'ArrowRight') nextL() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [isOpen, close, prev, nextL])

  return (
    <>
      {/* ── Viewport ────────────────────────────────────────────────────── */}
      <div
        ref={wrapRef}
        className="relative w-full overflow-hidden bg-black"
        style={{height: '100%', touchAction: 'none', overscrollBehavior: 'none', cursor: dragging.current ? 'grabbing' : 'grab'}}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onWheel={onWheel}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onDoubleClick={onDoubleClick}
      >
        {/* ── Canvas world (absolute positioned items) ────────────────── */}
        <div
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: canvasW + 64, // padding right
            height: totalHeight + 64,
            transformOrigin: '0 0',
            willChange: 'transform',
          }}
        >
          {/* Title block — lives on the canvas, scrolls with content */}
          {title && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: canvasW,
                height: TITLE_H,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                paddingBottom: 28,
                paddingLeft: 4,
              }}
            >
              <h1 style={{
                fontSize: 64,
                fontWeight: 800,
                color: 'white',
                letterSpacing: '-0.03em',
                lineHeight: 1,
                margin: 0,
                userSelect: 'none',
                pointerEvents: 'none',
              }}>
                {title}
              </h1>
              {description && (
                <p style={{
                  fontSize: 16,
                  color: 'rgba(255,255,255,0.45)',
                  marginTop: 10,
                  userSelect: 'none',
                  pointerEvents: 'none',
                }}>
                  {description}
                </p>
              )}
            </div>
          )}

          {/* Masonry cells — absolutely positioned */}
          {cells.map((cell) => {
            const isVideo = cell.item.mediaType === 'video'
            const src = sanityImageSrc(isVideo ? (cell.item.videoThumbnail ?? cell.item.image) : cell.item.image)
            const url = src
              ? urlForImage(src)?.width(cell.w * 2).height(cell.h * 2).fit('crop').auto('format').url() ?? null
              : null

            return (
              <button
                key={cell.item._key}
                data-item="true"
                onClick={() => setLightboxIdx(cell.index)}
                aria-label={cell.item.name ?? `Media ${cell.index + 1}`}
                style={{
                  position: 'absolute',
                  left: cell.x,
                  top: cell.y,
                  width: cell.w,
                  height: cell.h,
                  overflow: 'hidden',
                  background: '#18181b',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  transition: 'box-shadow 0.25s, transform 0.25s',
                }}
                className="group focus:outline-none"
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.transform = 'scale(1.02)'
                  el.style.zIndex = '10'
                  el.style.boxShadow = '0 12px 40px rgba(0,0,0,0.8)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.transform = ''
                  el.style.zIndex = ''
                  el.style.boxShadow = ''
                }}
              >
                {url ? (
                  <Image
                    src={url}
                    alt={cell.item.image?.alt ?? cell.item.name ?? ''}
                    fill
                    sizes={`${cell.w}px`}
                    className="object-cover"
                    draggable={false}
                  />
                ) : (
                  <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                    <span className="text-zinc-600 text-xs">No preview</span>
                  </div>
                )}

                {isVideo && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-12 h-12 bg-black/55 backdrop-blur-sm flex items-center justify-center rounded-full">
                      <Play className="w-5 h-5 text-white ml-0.5" fill="currentColor" />
                    </div>
                  </div>
                )}

                {cell.item.name && (
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent px-3 py-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <p className="text-white text-xs font-medium truncate">{cell.item.name}</p>
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* ── HUD ─────────────────────────────────────────────────────── */}
        <div className="absolute bottom-20 right-6 flex flex-col gap-2 z-20">
          <button onClick={zoomIn}    className="w-9 h-9 bg-zinc-800/80 backdrop-blur-sm hover:bg-zinc-700 text-white flex items-center justify-center transition-colors" aria-label="Zoom in"><ZoomIn className="w-4 h-4" /></button>
          <button onClick={zoomOut}   className="w-9 h-9 bg-zinc-800/80 backdrop-blur-sm hover:bg-zinc-700 text-white flex items-center justify-center transition-colors" aria-label="Zoom out"><ZoomOut className="w-4 h-4" /></button>
          <button onClick={resetView} className="w-9 h-9 bg-zinc-800/80 backdrop-blur-sm hover:bg-zinc-700 text-white flex items-center justify-center text-xs font-bold transition-colors" aria-label="Reset">1:1</button>
        </div>
        <div className="absolute bottom-6 left-6 text-zinc-600 text-xs z-20 pointer-events-none select-none">
          drag · pinch · scroll to zoom · double-click to focus
        </div>
      </div>

      {/* ── Lightbox ────────────────────────────────────────────────────── */}
      {isOpen && currentItem && (
        <div className="fixed inset-0 z-50 bg-black/96 flex" onClick={close} role="dialog" aria-modal="true">
          <button onClick={close} className="absolute top-4 right-4 z-50 w-10 h-10 bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors" aria-label="Close">
            <X className="w-5 h-5 text-white" />
          </button>
          {flatItems.length > 1 && (
            <>
              <button onClick={e => { e.stopPropagation(); prev() }} className="absolute left-4 top-1/2 -translate-y-1/2 z-50 w-10 h-10 bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors" aria-label="Previous"><ChevronLeft className="w-5 h-5 text-white" /></button>
              <button onClick={e => { e.stopPropagation(); nextL() }} className="absolute right-4 top-1/2 -translate-y-1/2 z-50 w-10 h-10 bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors" aria-label="Next"><ChevronRight className="w-5 h-5 text-white" /></button>
            </>
          )}
          <div className="flex w-full h-full flex-col lg:flex-row" onClick={e => e.stopPropagation()}>
            <div className="relative flex-1 flex items-center justify-center p-8">
              {currentItem.mediaType === 'video' && currentItem.video?.asset ? (
                <video src={(currentItem.video.asset as any).url} controls autoPlay className="max-w-full max-h-full" />
              ) : currentItem.image ? (
                <div className="relative w-full h-full">
                  <Image
                    src={urlForImage(sanityImageSrc(currentItem.image)!)?.width(2400).fit('max').auto('format').url() ?? ''}
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
                {currentItem.name && <h2 className="text-lg font-bold text-white mb-4 leading-tight">{currentItem.name}</h2>}
                {currentItem.description && <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">{currentItem.description}</p>}
                <p className="text-zinc-600 text-xs mt-auto pt-6">{lightboxIdx! + 1} / {flatItems.length}</p>
              </aside>
            )}
          </div>
          <p className="absolute bottom-3 left-1/2 -translate-x-1/2 text-zinc-600 text-xs pointer-events-none">← → navigate · ESC close</p>
        </div>
      )}
    </>
  )
}
