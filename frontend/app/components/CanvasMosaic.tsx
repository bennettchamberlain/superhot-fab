'use client'

/**
 * CanvasMosaic — justified mosaic inside a pannable/zoomable/pinchable
 * infinite canvas with a subtle 3D "overhead camera" perspective effect.
 *
 * Controls:
 *   • Drag to pan (damped — less reactive than 1:1, feels weighty)
 *   • Release with momentum → smooth deceleration
 *   • Scroll wheel → zoom centered on cursor
 *   • Pinch on touch → zoom centered between fingers
 *   • Ctrl+scroll → zoom (trackpad gesture)
 *   • Double-tap / double-click → zoom in on that spot
 *
 * Visual:
 *   • perspective() + rotateX() gives a subtle "camera tilted above" look
 *   • Tilt angle decreases as you zoom in (flat at max zoom, tilted at overview)
 *   • Items scale slightly as you hover (z-lift illusion)
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

interface RowItem {
  item: GalleryMediaItem
  displayWidth: number
  displayHeight: number
}

interface Row { items: RowItem[]; height: number }

interface Props {
  items: GalleryMediaItem[]
  targetRowHeight?: number
  maxCropFraction?: number
  gap?: number
}

// ─── Layout engine (same justified math as before) ────────────────────────────

function naturalRatio(item: GalleryMediaItem): number {
  const d = item.image?.asset?.metadata?.dimensions
  if (d?.width && d?.height) return d.width / d.height
  const v = item.videoThumbnail?.asset?.metadata?.dimensions
  if (v?.width && v?.height) return v.width / v.height
  return 4 / 3
}

function buildLayout(items: GalleryMediaItem[], containerW: number, targetH: number, maxCrop: number, gap: number): Row[] {
  if (containerW <= 0 || !items.length) return []
  const rows: Row[] = []
  let pending: {item: GalleryMediaItem; nw: number}[] = []

  const flush = (stretch: boolean) => {
    if (!pending.length) return
    const gapTotal = (pending.length - 1) * gap
    const usable = containerW - gapTotal
    const nTotal = pending.reduce((s, x) => s + x.nw, 0)
    const scale = stretch ? usable / nTotal : 1
    rows.push({
      height: targetH,
      items: pending.map(({item, nw}) => ({item, displayWidth: Math.round(nw * scale), displayHeight: targetH})),
    })
    pending = []
  }

  for (const item of items) {
    const nw = targetH * naturalRatio(item)
    pending.push({item, nw})
    const gapTotal = (pending.length - 1) * gap
    const usable = containerW - gapTotal
    const nTotal = pending.reduce((s, x) => s + x.nw, 0)
    const scale = usable / nTotal
    if (scale <= 1 && 1 - scale <= maxCrop) { flush(true); continue }
    if (scale < 1 - maxCrop) { pending.pop(); flush(true); pending.push({item, nw}) }
  }
  if (pending.length) {
    const gapTotal = (pending.length - 1) * gap
    const usable = containerW - gapTotal
    const nTotal = pending.reduce((s, x) => s + x.nw, 0)
    flush(nTotal / usable >= 0.6)
  }
  return rows
}

// ─── Physics constants ────────────────────────────────────────────────────────

const DRAG_DAMPING   = 0.62   // drag follows pointer at 62% speed — feels weighty
const FRICTION       = 0.88   // velocity multiplier each frame during coast
const ZOOM_MIN       = 0.25
const ZOOM_MAX       = 3.5
const TILT_MAX_DEG   = 8      // max perspective tilt at min zoom
const CANVAS_W       = 2400   // world width for layout engine

// ─── Component ────────────────────────────────────────────────────────────────

export function CanvasMosaic({
  items,
  targetRowHeight = 280,
  maxCropFraction = 0.18,
  gap = 4,
}: Props) {
  const wrapRef  = useRef<HTMLDivElement>(null)
  const rafRef   = useRef<number>(0)
  const velRef   = useRef({x: 0, y: 0})
  const camRef   = useRef({x: 0, y: 0})
  const scaleRef = useRef(1)
  const dragging = useRef(false)
  const lastPtr  = useRef({x: 0, y: 0})
  // touch pinch
  const pinchRef = useRef<{dist: number; midX: number; midY: number} | null>(null)

  // Render trigger — only re-render when lightbox changes; canvas pos via direct DOM
  const canvasRef = useRef<HTMLDivElement>(null)
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)
  const [, forceRender] = useState(0)

  const rows = buildLayout(items, CANVAS_W, targetRowHeight, maxCropFraction, gap)
  const flatItems = rows.flatMap((r) => r.items.map((i) => i.item))
  const canvasHeight = rows.reduce((s, r) => s + r.height + gap, 0)

  // Apply transform directly to DOM (no React re-render per frame)
  const applyTransform = useCallback(() => {
    const el = canvasRef.current
    if (!el) return
    const s = scaleRef.current
    const {x, y} = camRef.current
    // Tilt decreases as zoom increases — overhead camera feel
    const tilt = TILT_MAX_DEG * Math.max(0, 1 - (s - ZOOM_MIN) / (ZOOM_MAX - ZOOM_MIN))
    el.style.transform = `perspective(1400px) rotateX(${tilt}deg) translate(${x}px, ${y}px) scale(${s})`
  }, [])

  // Animation loop for inertia coast
  const tick = useCallback(() => {
    const vx = velRef.current.x
    const vy = velRef.current.y
    if (Math.abs(vx) < 0.1 && Math.abs(vy) < 0.1) {
      velRef.current = {x: 0, y: 0}
      return
    }
    camRef.current = {x: camRef.current.x + vx, y: camRef.current.y + vy}
    velRef.current = {x: vx * FRICTION, y: vy * FRICTION}
    applyTransform()
    rafRef.current = requestAnimationFrame(tick)
  }, [applyTransform])

  // ── Pointer drag ──
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
    // Kick off inertia coast
    rafRef.current = requestAnimationFrame(tick)
  }, [tick])

  // ── Wheel zoom ──
  const onWheel = useCallback((e: WheelEvent<HTMLDivElement>) => {
    e.preventDefault()
    const rect = wrapRef.current!.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    if (e.ctrlKey || e.metaKey || Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      const delta = -(e.deltaY) * (e.ctrlKey || e.metaKey ? 0.008 : 0.002)
      const prev = scaleRef.current
      const next = Math.min(Math.max(prev + delta * prev, ZOOM_MIN), ZOOM_MAX)
      const ratio = next / prev
      camRef.current = {
        x: mx - ratio * (mx - camRef.current.x),
        y: my - ratio * (my - camRef.current.y),
      }
      scaleRef.current = next
    } else {
      camRef.current = {x: camRef.current.x - e.deltaX * DRAG_DAMPING, y: camRef.current.y - e.deltaY * DRAG_DAMPING}
    }
    applyTransform()
  }, [applyTransform])

  // ── Pinch zoom (touch) ──
  const onTouchStart = useCallback((e: TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      const a = e.touches[0], b = e.touches[1]
      const dist = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY)
      const midX = (a.clientX + b.clientX) / 2
      const midY = (a.clientY + b.clientY) / 2
      pinchRef.current = {dist, midX, midY}
    }
  }, [])

  const onTouchMove = useCallback((e: TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2 && pinchRef.current) {
      e.preventDefault()
      const a = e.touches[0], b = e.touches[1]
      const dist = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY)
      const midX = (a.clientX + b.clientX) / 2
      const midY = (a.clientY + b.clientY) / 2
      const rect = wrapRef.current!.getBoundingClientRect()
      const mx = midX - rect.left
      const my = midY - rect.top

      const ratio = dist / pinchRef.current.dist
      const prev = scaleRef.current
      const next = Math.min(Math.max(prev * ratio, ZOOM_MIN), ZOOM_MAX)
      const scaleRatio = next / prev

      camRef.current = {
        x: mx - scaleRatio * (mx - camRef.current.x) + (midX - pinchRef.current.midX),
        y: my - scaleRatio * (my - camRef.current.y) + (midY - pinchRef.current.midY),
      }
      scaleRef.current = next
      pinchRef.current = {dist, midX, midY}
      applyTransform()
    }
  }, [applyTransform])

  const onTouchEnd = useCallback(() => { pinchRef.current = null }, [])

  // ── Double-click to zoom in ──
  const onDoubleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('[data-item]')) return
    const rect = wrapRef.current!.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    const prev = scaleRef.current
    const next = prev >= 1.8 ? 1 : Math.min(prev * 1.8, ZOOM_MAX)
    const ratio = next / prev
    camRef.current = {x: mx - ratio * (mx - camRef.current.x), y: my - ratio * (my - camRef.current.y)}
    scaleRef.current = next
    applyTransform()
  }, [applyTransform])

  // Zoom buttons
  const zoomIn  = () => { scaleRef.current = Math.min(scaleRef.current * 1.3, ZOOM_MAX); applyTransform() }
  const zoomOut = () => { scaleRef.current = Math.max(scaleRef.current / 1.3, ZOOM_MIN); applyTransform() }
  const resetView = () => { camRef.current = {x: 0, y: 0}; scaleRef.current = 1; applyTransform() }

  useEffect(() => { applyTransform() }, [applyTransform])
  useEffect(() => () => cancelAnimationFrame(rafRef.current), [])

  // Lightbox
  const isOpen = lightboxIdx !== null
  const currentItem = isOpen ? flatItems[lightboxIdx] : null
  const close = useCallback(() => setLightboxIdx(null), [])
  const prev  = useCallback(() => setLightboxIdx((i) => i === null ? null : (i - 1 + flatItems.length) % flatItems.length), [flatItems.length])
  const next  = useCallback(() => setLightboxIdx((i) => i === null ? null : (i + 1) % flatItems.length), [flatItems.length])

  useEffect(() => { document.body.style.overflow = isOpen ? 'hidden' : ''; return () => { document.body.style.overflow = '' } }, [isOpen])
  useEffect(() => {
    if (!isOpen) return
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); if (e.key === 'ArrowLeft') prev(); if (e.key === 'ArrowRight') next() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [isOpen, close, prev, next])

  let flatIdx = 0

  return (
    <>
      {/* ── Viewport ────────────────────────────────────────────────────── */}
      <div
        ref={wrapRef}
        className="relative w-full overflow-hidden bg-black"
        style={{height: '100svh', touchAction: 'none', overscrollBehavior: 'none', cursor: dragging.current ? 'grabbing' : 'grab'}}
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
        {/* Canvas world */}
        <div
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: CANVAS_W,
            transformOrigin: '0 0',
            willChange: 'transform',
          }}
        >
          {rows.map((row, rowIdx) => (
            <div
              key={rowIdx}
              className="flex"
              style={{gap, marginBottom: rowIdx < rows.length - 1 ? gap : 0}}
            >
              {row.items.map((cell) => {
                const idx = flatIdx++
                const isVideo = cell.item.mediaType === 'video'
                const src = isVideo ? (cell.item.videoThumbnail ?? cell.item.image) : cell.item.image
                const url = src
                  ? urlForImage(src)?.width(cell.displayWidth * 2).height(cell.displayHeight * 2).fit('crop').auto('format').url() ?? null
                  : null

                return (
                  <button
                    key={cell.item._key}
                    data-item="true"
                    onClick={() => setLightboxIdx(idx)}
                    className="group relative overflow-hidden bg-zinc-900 flex-none focus:outline-none"
                    style={{
                      width: cell.displayWidth,
                      height: cell.displayHeight,
                      transition: 'filter 0.3s, transform 0.3s',
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateZ(0) scale(1.025)'; (e.currentTarget as HTMLElement).style.zIndex = '10'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(0,0,0,0.7)' }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.zIndex = ''; (e.currentTarget as HTMLElement).style.boxShadow = '' }}
                    aria-label={cell.item.name ?? `Media ${idx + 1}`}
                  >
                    {url ? (
                      <Image
                        src={url}
                        alt={cell.item.image?.alt ?? cell.item.name ?? ''}
                        fill
                        sizes={`${cell.displayWidth}px`}
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
                        <div className="w-12 h-12 bg-black/55 backdrop-blur-sm flex items-center justify-center">
                          <Play className="w-5 h-5 text-white ml-0.5" fill="currentColor" />
                        </div>
                      </div>
                    )}

                    {cell.item.name && (
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent px-2.5 py-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <p className="text-white text-xs font-medium truncate">{cell.item.name}</p>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          ))}
        </div>

        {/* HUD */}
        <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-20 pointer-events-auto">
          <button onClick={zoomIn}   className="w-9 h-9 bg-zinc-800/80 backdrop-blur-sm hover:bg-zinc-700 text-white flex items-center justify-center transition-colors" aria-label="Zoom in"><ZoomIn className="w-4 h-4" /></button>
          <button onClick={zoomOut}  className="w-9 h-9 bg-zinc-800/80 backdrop-blur-sm hover:bg-zinc-700 text-white flex items-center justify-center transition-colors" aria-label="Zoom out"><ZoomOut className="w-4 h-4" /></button>
          <button onClick={resetView} className="w-9 h-9 bg-zinc-800/80 backdrop-blur-sm hover:bg-zinc-700 text-white flex items-center justify-center text-xs font-bold transition-colors" aria-label="Reset">1:1</button>
        </div>

        <div className="absolute bottom-6 left-6 text-zinc-600 text-xs z-20 pointer-events-none select-none">
          drag · pinch · scroll to zoom · double-click to focus
        </div>
      </div>

      {/* ── Lightbox ────────────────────────────────────────────────────── */}
      {isOpen && currentItem && (
        <div className="fixed inset-0 z-50 bg-black/96 flex" onClick={close} role="dialog" aria-modal="true">
          <button onClick={close} className="absolute top-4 right-4 z-50 w-10 h-10 bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors" aria-label="Close"><X className="w-5 h-5 text-white" /></button>
          {flatItems.length > 1 && <>
            <button onClick={(e) => {e.stopPropagation(); prev()}} className="absolute left-4 top-1/2 -translate-y-1/2 z-50 w-10 h-10 bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors" aria-label="Previous"><ChevronLeft className="w-5 h-5 text-white" /></button>
            <button onClick={(e) => {e.stopPropagation(); next()}} className="absolute right-4 top-1/2 -translate-y-1/2 z-50 w-10 h-10 bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors" aria-label="Next"><ChevronRight className="w-5 h-5 text-white" /></button>
          </>}
          <div className="flex w-full h-full flex-col lg:flex-row" onClick={(e) => e.stopPropagation()}>
            <div className="relative flex-1 flex items-center justify-center p-8">
              {currentItem.mediaType === 'video' && currentItem.video?.asset ? (
                <video src={(currentItem.video.asset as any).url} controls autoPlay className="max-w-full max-h-full" />
              ) : currentItem.image ? (
                <div className="relative w-full h-full">
                  <Image src={urlForImage(currentItem.image)?.width(2400).fit('max').auto('format').url() ?? ''} alt={currentItem.image.alt ?? currentItem.name ?? ''} fill className="object-contain" sizes="(max-width: 1024px) 100vw, 80vw" priority />
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
