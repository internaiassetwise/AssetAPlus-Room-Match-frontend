// src/components/Hero.jsx — Section 1 per designer brief.
//
// Navy-tinted rooftop photo background with white headline + 3 stat tiles.
// Right-side snapshot card was cut from the previous design; a simpler
// "ลงทะเบียนแจ้งความสนใจ" CTA replaces it and scrolls to #persona-section.

import { ArrowRight, Star, ChevronDown } from './icons.jsx'
import { Link } from 'react-router-dom'
import { HERO, STATS_LANDING } from '../data/content.js'

function StatTile({ num, label, isStar }) {
  return (
    <div>
      <div className="font-bold text-3xl sm:text-4xl text-white tabular-nums flex items-center gap-1.5">
        {num}
        {isStar && <Star size={22} className="text-amber-300" filled />}
      </div>
      <div className="text-sm text-white/75 mt-1.5 leading-tight">{label}</div>
    </div>
  )
}

export default function Hero() {
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
        {/* Navy scrim (40%) over the photo so white headline + body text is readable */}
        <div className="absolute inset-0 bg-navy-900/60" />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-900/40 via-transparent to-navy-900/80" />
      </div>

      <div className="container-page relative py-20 sm:py-24 lg:py-32 min-h-[640px] grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-16 items-center">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 text-white px-3.5 py-1.5 text-sm font-semibold border border-white/20 backdrop-blur-sm">
            {HERO.eyebrow}
          </span>

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
              href="#persona-section"
              className="btn bg-ember-500 text-white px-7 py-3.5 text-[17px] font-semibold rounded-xl shadow-ember hover:bg-ember-600 active:bg-ember-700"
            >
              ลงทะเบียนแจ้งความสนใจ <ArrowRight size={18} />
            </a>
            <Link
              to="/search"
              className="btn bg-white/10 text-white border border-white/25 px-7 py-3.5 text-[17px] font-semibold rounded-xl hover:bg-white/15 backdrop-blur-sm"
            >
              ดูห้องว่าง
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-6 max-w-xl">
            {STATS_LANDING.map((s) => (
              <StatTile key={s.label} num={s.num} label={s.label} isStar={s.label === 'ความพึงพอใจ'} />
            ))}
          </div>
        </div>

        <div className="relative hidden lg:block">
          <div className="card p-7 sm:p-8 bg-white/95 backdrop-blur shadow-lift">
            <div className="flex items-center justify-between pb-5 border-b border-line">
              <div>
                <div className="text-[11px] font-semibold text-muted uppercase tracking-wider">
                  ห้องว่างพร้อมเข้าอยู่
                </div>
                <div className="font-bold text-navy-700 text-xl mt-1">
                  Roommatch
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> พร้อมดูแล
              </span>
            </div>
            <p className="mt-5 text-muted text-[15px] leading-relaxed">
              แพลตฟอร์มที่ช่วยจับคู่ผู้เช่าและเจ้าของห้อง
              อัพเดทสถานะห้องเช่าเสมอ ติดต่อสอบถามเพิ่มเติมได้ทาง Line ทันที
            </p>
            <div className="mt-7 grid grid-cols-2 gap-4">
              <div>
                <div className="font-bold text-navy-700 text-2xl sm:text-3xl tabular-nums">200+</div>
                <div className="text-xs text-muted mt-1">ครอบคลุม 8 ทำเลใน กทม./ปริมณฑล</div>
              </div>
              <div>
                <div className="font-bold text-navy-700 text-2xl sm:text-3xl tabular-nums">7 วัน</div>
                <div className="text-xs text-muted mt-1">เฉลี่ยหาผู้เช่าได้เร็ว</div>
              </div>
            </div>
            <a
              href="#persona-section"
              className="mt-6 inline-flex items-center gap-2 text-navy-700 text-sm font-semibold hover:underline"
            >
              ดูห้องว่าง → ลงทะเบียนแจ้งความสนใจ <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </div>

      <a
        href="#persona-section"
        aria-label="Scroll to flow"
        className="absolute bottom-5 left-1/2 -translate-x-1/2 hidden md:inline-flex items-center justify-center w-10 h-10 rounded-full border border-white/25 text-white/85 hover:bg-white/10"
      >
        <ChevronDown size={20} />
      </a>
    </section>
  )
}
