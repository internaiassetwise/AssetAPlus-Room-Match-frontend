// src/components/Hero.jsx — Section 1 per designer brief.
//
// Brief page 2: navy-tinted rooftop photo background, white "Roommatch" headline,
// body copy explaining the matchmaking angle. Green Line CTA primary + /search
// secondary. Stat tiles driven from /api/stats. Right-side card replaced with a
// photo of an actual room from the DB (RoomPhotoTile). Scroll-down chevron cut.

import { useEffect, useState } from 'react'
import { ArrowRight, Star } from './icons.jsx'
import { Link } from 'react-router-dom'
import { HERO, STATS_LANDING } from '../data/content.js'
import { api } from '../api/client.js'

// Renders one stat tile. Page Feedback annotation: tile shows
// "XX ห้อง" on line 1 (value + unit inline) and the descriptor label
// ("ที่มีในสต๊อก" / "ที่ Match แล้ว") on line 2 below.
function StatTile({ value, unit, label, isStar, loading }) {
  return (
    <div>
      <div className="font-bold text-3xl sm:text-4xl text-white tabular-nums flex items-baseline gap-1.5">
        {loading ? (
          <span className="inline-block w-14 h-9 rounded bg-white/15 animate-pulse" />
        ) : (
          <>
            <span>{value ?? '—'}</span>
            {unit && <span className="text-base sm:text-lg font-semibold text-white/85">{unit}</span>}
            {isStar && <Star size={22} className="text-amber-300" />}
          </>
        )}
      </div>
      <div className="text-sm text-white/75 mt-1.5 leading-tight">{label}</div>
    </div>
  )
}

// Renders a carousel of room photos — auto-cycles every 4.5s with a fade
// transition. Page Feedback annotation #1: hero right tile becomes a
// slideshow of room pictures that auto-scrolls to the next slide.
function RoomPhotoTile() {
  const [slides, setSlides] = useState([])
  const [index,  setIndex]  = useState(0)

  useEffect(() => {
    let alive = true
    // Server hard-codes `status = 'available'` in SQL; no `status` query param
    // exists, so we only send `limit`.
    api.listRooms({ limit: 20 })
      .then((res) => {
        if (!alive) return
        // Backend returns a RAW array (no { data } envelope).
        const rooms = Array.isArray(res) ? res : (res?.data || [])
        // Randomize order so each visit shows a different room first.
        // Fisher-Yates shuffle on a copy.
        const shuffled = rooms.slice()
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
        }
        // Flatten rooms → { src, title } slide list. Cap at 8 to keep payload
        // + memory bounded; take the first photo of each room so the carousel
        // shows one photo per room rather than every photo on every room.
        // Accept both `image` (singular string, current API) and `photos`
        // (array, legacy/alt API) for compatibility.
        const items = []
        const seen = new Set()
        for (const r of shuffled) {
          const src = (Array.isArray(r.photos) && r.photos[0])
            || (typeof r.image === 'string' && r.image)
            || null
          if (src && !seen.has(src)) {
            seen.add(src)
            items.push({ src, title: r.title || r.zone || 'RoomMatch ห้องว่าง' })
          }
          if (items.length >= 8) break
        }
        setSlides(items)
      })
      .catch(() => {})
    return () => { alive = false }
  }, [])

  // Auto-advance. Pause when fewer than 2 slides or when tab is hidden so we
  // don't waste cycles the user can't see.
  useEffect(() => {
    if (slides.length < 2) return
    const tick = () => setIndex((i) => (i + 1) % slides.length)
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') tick()
    }, 4500)
    return () => clearInterval(id)
  }, [slides.length])

  if (slides.length === 0) {
    return (
      <div className="relative h-full min-h-[420px] rounded-2xl overflow-hidden bg-white/10 backdrop-blur-sm border border-white/15 grid place-items-center text-white/60 text-sm">
        ไม่พบรูปห้อง
      </div>
    )
  }

  const goPrev = () => setIndex((i) => (i - 1 + slides.length) % slides.length)
  const goNext = () => setIndex((i) => (i + 1) % slides.length)

  return (
    <div className="relative h-full min-h-[420px] rounded-2xl overflow-hidden shadow-lift group">
      {/* Slides — stacked, opacity-toggled for crossfade. */}
      {slides.map((s, i) => (
        <img
          key={s.src}
          src={s.src}
          alt={s.title}
          loading={i === 0 ? 'eager' : 'lazy'}
          aria-hidden={i !== index}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${
            i === index ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}

      {/* Title + slide counter overlay */}
      <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-navy-900/85 via-navy-900/40 to-transparent pointer-events-none">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-white/70">
          ห้องว่างพร้อมอยู่
        </div>
        <div className="font-bold text-white text-lg mt-1 line-clamp-1">{slides[index].title}</div>
      </div>

      {/* Prev / next controls — appear on hover, ≥44×44 hit area. */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={goPrev}
            aria-label="ภาพก่อนหน้า"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 grid place-items-center rounded-full bg-white/15 backdrop-blur-sm text-white border border-white/25 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity hover:bg-white/25"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="ภาพถัดไป"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 grid place-items-center rounded-full bg-white/15 backdrop-blur-sm text-white border border-white/25 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity hover:bg-white/25"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          {/* Dot indicators */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {slides.map((s, i) => (
              <button
                key={`dot-${i}`}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`ไปภาพที่ ${i + 1}`}
                aria-current={i === index}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? 'w-6 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default function Hero() {
  const [stats, setStats]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    api.listStats()
      .then((res) => { if (alive) setStats(res || null) })
      .catch(() => { if (alive) setStats(null) })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [])

  return (
    <section id="hero" className="relative overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="/images/rooftop-pool.jpg"
          alt=""
          className="w-full h-full object-cover"
          loading="eager"
        />
        {/* Navy scrim (60%) over the photo so white headline + body text is readable */}
        <div className="absolute inset-0 bg-navy-900/60" />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-900/40 via-transparent to-navy-900/80" />
      </div>

      <div className="container-page relative py-20 sm:py-24 lg:py-32 min-h-[640px] grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-16 items-center">
        <div>
          {HERO.eyebrow && (
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 text-white px-3.5 py-1.5 text-sm font-semibold border border-white/20 backdrop-blur-sm">
              {HERO.eyebrow}
            </span>
          )}

          <h1 className="mt-6 font-bold text-white leading-[1.2] text-[44px] sm:text-5xl lg:text-[56px] xl:text-[64px] tracking-tight">
            {HERO.title.map((line, i) => (
              <span key={i} className="block">
                {line.tone === 'accent' ? (
                  <span className="text-ember-400">{line.text}</span>
                ) : (
                  line.text
                )}
              </span>
            ))}
          </h1>

          <p className="mt-7 text-white/85 text-lg sm:text-xl max-w-xl leading-relaxed">
            {HERO.body}
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <a
              href={HERO.primaryCta.href}
              target="_blank"
              rel="noopener noreferrer"
              className="btn px-7 py-3.5 text-[17px] font-semibold rounded-xl inline-flex items-center gap-2 bg-[#06C755] text-white hover:bg-[#05b34d] shadow-ember"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016a.63.63 0 01-.629.628.62.62 0 01-.503-.252l-2.443-3.317v2.94a.629.629 0 01-1.257 0V8.108a.628.628 0 011.13-.378l2.442 3.317V8.108a.628.628 0 011.26 0v4.771zm-5.741 0a.629.629 0 01-.629.629.628.628 0 01-.626-.629V8.108a.627.627 0 011.255 0v4.771zm-2.466.629H4.917a.624.624 0 01-.626-.629V8.108a.625.625 0 011.252 0v4.141h1.755c.349 0 .629.283.629.63 0 .344-.28.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
              </svg>
              {HERO.primaryCta.text}
            </a>
            <Link
              to={HERO.secondaryCta.to}
              className="btn bg-white/10 text-white border border-white/25 px-7 py-3.5 text-[17px] font-semibold rounded-xl hover:bg-white/15 backdrop-blur-sm inline-flex items-center gap-2"
            >
              {HERO.secondaryCta.text} <ArrowRight size={18} />
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-6 max-w-xl">
            {STATS_LANDING.map((s) => {
              const raw = stats?.[s.key]
              let display = '—'
              if (raw != null) {
                if (s.isStar) display = Number(raw).toFixed(1)
                else display = `${raw}+`
              }
              return (
                <StatTile
                  key={s.key}
                  value={display}
                  unit={s.unit}
                  label={s.label}
                  isStar={s.isStar}
                  loading={loading}
                />
              )
            })}
          </div>
        </div>

        <div className="relative hidden lg:block">
          <RoomPhotoTile />
        </div>
      </div>
    </section>
  )
}