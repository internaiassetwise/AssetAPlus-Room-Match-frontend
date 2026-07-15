// src/components/LandlordListingsCTA.jsx — brief page 7.
//
// Page Feedback annotation #1/#2/#3:
//   • Dropped inner `<section><div class="container-page">` wrapper so the
//     card fills the parent PersonaFlow's container-page (no double-narrow).
//   • Removed last bullet ("ปล่อยห้องได้เร็วขึ้น / เฉลี่ยภายใน 7 วัน") — kept
//     the 3 strongest benefits only.
//   • Removed "ดูวิดีโอประกาศ" secondary button — primary Line CTA is enough.

import { BadgeCheck, LineChat, Plus, Bolt } from './icons.jsx'
import { LANDLORD_BENEFITS, LANDLORD_CTA } from '../data/content.js'

const BENEFIT_ICON = {
  free:   Plus,
  target: BadgeCheck,
  bell:   LineChat,
  fast:   Bolt,
}

export default function LandlordListingsCTA({ theme }) {
  const accentText = theme?.accentText || 'text-ember-600'

  return (
    <div className="card overflow-hidden grid lg:grid-cols-[1.05fr_1fr] items-stretch">
      <div className="p-6 sm:p-8 lg:p-12 flex flex-col justify-center">
        <span className="eyebrow self-start">{LANDLORD_CTA.eyebrow}</span>
        <h2 className="mt-4 font-bold text-navy-700 text-3xl sm:text-4xl tracking-tight leading-tight">
          {LANDLORD_CTA.titleA} <span className={accentText}>{LANDLORD_CTA.titleAccent}</span>
        </h2>
        {LANDLORD_CTA.body && (
          <p className="mt-4 text-muted text-base sm:text-lg max-w-lg leading-relaxed">
            {LANDLORD_CTA.body}
          </p>
        )}
        <p className="mt-3 text-xs text-muted">
          ลงประกาศห้องได้ฟรี มีทีมงานคุณภาพช่วยดูแลและ หาผู้เช่าคุณภาพให้คุณได้อย่างรวดเร็ว
        </p>

        <ul className="mt-7 space-y-3.5">
          {LANDLORD_BENEFITS.filter((b) => b.icon !== 'fast').map((b) => {
            const Icon = BENEFIT_ICON[b.icon] || BadgeCheck
            return (
              <li key={b.title} className="flex items-start gap-3 text-navy-700 text-[15px]">
                <Icon size={20} className={`${accentText} mt-0.5 flex-shrink-0`} />
                <span>
                  <span className="font-semibold">{b.title}</span>
                  <span className="text-muted"> — {b.desc}</span>
                </span>
              </li>
            )
          })}
        </ul>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a
            href={LANDLORD_CTA.primaryHref || 'https://line.me/R/ti/p/%40assetaplus?text=%E0%B8%AA%E0%B8%A7%E0%B8%B1%E0%B8%AA%E0%B8%94%E0%B8%B5%E0%B8%84%E0%B9%88%E0%B8%B0%20%E0%B8%AD%E0%B8%A2%E0%B8%B2%E0%B8%81%E0%B8%A5%E0%B8%87%E0%B8%9B%E0%B8%A3%E0%B8%B0%E0%B8%81%E0%B8%B2%E0%B8%A8%E0%B8%AB%E0%B9%89%E0%B8%AD%E0%B8%87%E0%B9%83%E0%B8%AB%E0%B9%89%E0%B9%80%E0%B8%8A%E0%B9%88%E0%B8%B2%E0%B8%84%E0%B9%88%E0%B8%B0'}
            target="_blank"
            rel="noreferrer noopener"
            className="btn bg-ember-500 text-white px-6 py-3 text-base font-semibold rounded-xl shadow-ember hover:bg-ember-600 active:bg-ember-700"
          >
            <LineChat size={18} /> {LANDLORD_CTA.primary}
          </a>
        </div>
      </div>

      {/* Image card — gradient overlay so the photo doesn't read as a blank
          panel. items-stretch on the grid parent handles equal column
          heights without needing min-h. */}
      <div className="relative bg-navy-50 hidden lg:block overflow-hidden">
        <img
          src="/images/hero-pool.jpg"
          alt="ตัวอย่างห้องจริง"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: 'center 35%' }}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/55 via-navy-900/10 to-transparent" />
      </div>
    </div>
  )
}