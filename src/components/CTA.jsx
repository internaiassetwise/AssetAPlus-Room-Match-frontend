// src/components/CTA.jsx — Section 5 bottom strip per designer brief page 8.
//
// Dark navy background. Headline "ทุกเรื่อง ติดต่อผ่านแอดมิน", three CTAs
// (Line, phone, see all), and a single-line trust strip underneath.

import { Phone, LineChat, ArrowRight, BadgeCheck } from './icons.jsx'
import { Link } from 'react-router-dom'
import { BOTTOM_CTA } from '../data/content.js'
import { LINE_OA_DISPLAY, LINE_OA_URL } from '../config/line.js'

export default function CTA() {
  return (
    <section id="cta" className="section bg-navy-700 text-white relative overflow-hidden">
      {/* Subtle gradient accent */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-30"
        style={{ backgroundImage: 'radial-gradient(circle at 80% 0%, rgba(249,115,22,0.20), transparent 60%)' }}
      />

      <div className="container-page relative">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 text-white px-4 py-1.5 text-sm font-semibold border border-white/15">
            <BadgeCheck size={16} className="text-ember-400" /> {BOTTOM_CTA.eyebrow}
          </span>

          <h2 className="mt-6 font-bold text-white text-4xl sm:text-5xl lg:text-[60px] leading-[1.2] tracking-tight">
            {BOTTOM_CTA.title.map((line, i) => (
              <span key={i}>
                {i > 0 && <br />}
                {line.tone === 'accent' ? (
                  <span className="text-ember-400">{line.text}</span>
                ) : (
                  line.text
                )}
              </span>
            ))}
          </h2>

          <p className="mt-6 text-white/75 text-lg sm:text-xl max-w-xl mx-auto leading-relaxed">
            {BOTTOM_CTA.body}
          </p>

          <div className="mt-9 flex flex-wrap gap-3 justify-center">
            <a
              href={LINE_OA_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="btn bg-[#06C755] text-white px-7 py-3.5 font-semibold rounded-xl hover:bg-[#05b34c] text-[17px]"
            >
              <LineChat size={18} /> แชท Line {LINE_OA_DISPLAY}
            </a>
            <a href="tel:021680000" className="btn bg-white text-navy-700 px-7 py-3.5 font-semibold rounded-xl hover:bg-cream-50 text-[17px]">
              <Phone size={18} /> 02-168-0000
            </a>
            <Link to="/contact-admin" className="btn bg-white/10 text-white border border-white/20 px-7 py-3.5 font-semibold rounded-xl hover:bg-white/15 text-[17px]">
              ดูช่องทางติดต่อทั้งหมด <ArrowRight size={18} />
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-7 gap-y-2.5 text-white/85 text-base">
            {BOTTOM_CTA.trust.map((t) => (
              <span key={t} className="inline-flex items-center gap-2">
                <BadgeCheck size={16} className="text-ember-400" /> {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
