// src/components/LandlordListingsCTA.jsx — brief page 7.
//
// Side-by-side: copy + benefit bullets on the left, image on the right,
// primary "ลงประกาศห้องฟรีเลย" CTA → opens Line with prefilled Thai.

import { BadgeCheck, LineChat, Plus, Bolt, Inbox } from './icons.jsx'
import { LANDLORD_BENEFITS, LANDLORD_CTA } from '../data/content.js'

const BENEFIT_ICON = {
  free:   Plus,
  target: BadgeCheck,
  bell:   LineChat,
  fast:   Bolt,
}

export default function LandlordListingsCTA() {
  return (
    <section className="section bg-cream-50">
      <div className="container-page">
        <div className="card overflow-hidden grid lg:grid-cols-2 items-stretch">
          <div className="p-7 sm:p-10 lg:p-12 flex flex-col justify-center">
            <span className="eyebrow">{LANDLORD_CTA.eyebrow}</span>
            <h2 className="mt-4 font-bold text-navy-700 text-3xl sm:text-4xl tracking-tight leading-tight">
              {LANDLORD_CTA.titleA} <span className="text-ember-600">{LANDLORD_CTA.titleAccent}</span>
            </h2>
            <p className="mt-4 text-muted text-base sm:text-lg max-w-lg leading-relaxed">
              {LANDLORD_CTA.body}
            </p>
            <p className="mt-3 text-xs text-muted">
              ลงประกาศห้องได้ฟรี มีทีมงานคุณภาพช่วยดูแล หาผู้เช่า
            </p>

            <ul className="mt-7 space-y-3.5">
              {LANDLORD_BENEFITS.map((b) => {
                const Icon = BENEFIT_ICON[b.icon] || BadgeCheck
                return (
                  <li key={b.title} className="flex items-start gap-3 text-navy-700 text-[15px]">
                    <Icon size={20} className="text-ember-600 mt-0.5 flex-shrink-0" />
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
                href="https://line.me/R/ti/p/%40assetaplus?text=%E0%B8%AA%E0%B8%A7%E0%B8%B1%E0%B8%AA%E0%B8%94%E0%B8%B5%E0%B8%84%E0%B9%88%E0%B8%B0%20%E0%B8%AD%E0%B8%A2%E0%B8%B2%E0%B8%81%E0%B8%A5%E0%B8%87%E0%B8%9B%E0%B8%A3%E0%B8%B0%E0%B8%81%E0%B8%B2%E0%B8%A8%E0%B8%AB%E0%B9%89%E0%B8%AD%E0%B8%87%E0%B9%83%E0%B8%AB%E0%B9%89%E0%B9%80%E0%B8%8A%E0%B9%88%E0%B8%B2%E0%B8%84%E0%B9%88%E0%B8%B0"
                target="_blank"
                rel="noreferrer noopener"
                className="btn bg-ember-500 text-white px-6 py-3 text-base font-semibold rounded-xl shadow-ember hover:bg-ember-600 active:bg-ember-700"
              >
                <LineChat size={18} /> {LANDLORD_CTA.primary}
              </a>
              <button
                type="button"
                className="btn btn-outline px-6 py-3 text-base"
              >
                {LANDLORD_CTA.secondary}
              </button>
              <span className="text-xs text-muted">{LANDLORD_CTA.helper}</span>
            </div>
          </div>

          <div className="relative bg-navy-50 hidden lg:block">
            <img
              src="/images/hero-pool.jpg"
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
