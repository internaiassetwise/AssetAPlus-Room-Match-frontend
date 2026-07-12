// src/components/Lightbox.jsx — Full-screen photo viewer with prev/next.
//
// Click a photo in a gallery → this overlay shows it large, with left/right
// arrows, a counter, and keyboard nav (← → to move, Esc to close). Click the
// backdrop to close; the image itself stops propagation so dragging/clicking it
// doesn't dismiss.
//
//   <Lightbox images={photos} index={i} onClose={...} onIndex={setIndex} />

import { useEffect, useCallback } from 'react'
import { Close, ChevronLeft, ChevronRight } from './icons.jsx'

export default function Lightbox({ images = [], index, onClose, onIndex }) {
  const count = images.length

  const go = useCallback(
    (dir) => { if (count) onIndex((index + dir + count) % count) },
    [index, count, onIndex],
  )

  useEffect(() => {
    if (index == null) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
      else if (e.key === 'ArrowRight') go(1)
      else if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [go, onClose, index])

  if (index == null || !count) return null
  const img = images[index]

  return (
    <div
      className="fixed inset-0 z-[70] bg-navy-900/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-up"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="ดูรูปภาพ"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="ปิด"
        className="absolute top-4 right-4 w-11 h-11 grid place-items-center rounded-full bg-white/10 text-white hover:bg-white/25 transition-colors"
      >
        <Close size={22} />
      </button>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); go(-1) }}
            aria-label="รูปก่อนหน้า"
            className="absolute left-3 sm:left-6 w-12 h-12 grid place-items-center rounded-full bg-white/10 text-white hover:bg-white/25 transition-colors"
          >
            <ChevronLeft size={28} />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); go(1) }}
            aria-label="รูปถัดไป"
            className="absolute right-3 sm:right-6 w-12 h-12 grid place-items-center rounded-full bg-white/10 text-white hover:bg-white/25 transition-colors"
          >
            <ChevronRight size={28} />
          </button>
        </>
      )}

      <img
        src={img}
        alt=""
        className="max-w-[92vw] max-h-[86vh] object-contain rounded-xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        decoding="async"
      />

      {count > 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/85 text-sm bg-white/10 px-3.5 py-1 rounded-full tabular-nums">
          {index + 1} / {count}
        </div>
      )}
    </div>
  )
}
