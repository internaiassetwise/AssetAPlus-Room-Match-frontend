// src/components/RoomCard.jsx — shared card used by the landing listings grid
// AND (potentially) by SearchPage's list rows. Extracted so both callers get
// the same look without duplicating markup.

import { MapPin, Bed, Bath, Ruler, Clock, ArrowRight } from './icons.jsx'
import { useContent } from '../i18n/useContent.js'
import { useLang } from '../i18n/LanguageContext.jsx'

const BADGE_TONE = {
  green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  ember: 'bg-ember-50 text-ember-700 border-ember-200',
  navy:  'bg-navy-50 text-navy-700 border-navy-200',
}

export function RoomCard({ room, onOpen }) {
  const { UI } = useContent()
  const { lang } = useLang()
  // The API ships `badge` as a Thai string. Derive it from the same fields it
  // came from, so it follows the language instead of staying frozen in Thai.
  const badgeLabel = room.isFeatured ? UI.badgeFeatured
    : room.status === 'available' ? UI.badgeAvailable : UI.badgeSoon
  const tone = BADGE_TONE[room.badgeTone] || BADGE_TONE.ember
  return (
    <article
      className="card card-hover overflow-hidden group cursor-pointer"
      onClick={() => onOpen?.(room)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen?.(room) } }}
      aria-label={`${UI.cardViewDetails} ${room.title}`}
    >
      <div className="relative aspect-[4/3] bg-cream-100 overflow-hidden">
        {room.image && (
          <img
            src={room.image}
            alt={room.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        {room.badge && (
          <span className={`absolute top-3.5 left-3.5 inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full ${tone}`}>
            {room.badgeTone === 'ember' && <Clock size={12} />}
            {badgeLabel}
          </span>
        )}
      </div>
      <div className="p-6">
        <div className="flex items-center gap-1.5 text-sm font-medium text-muted">
          <MapPin size={14} /> {lang === 'en' ? (room.zoneEn || room.zone) : room.zone}
        </div>
        <h3 className="mt-2 font-bold text-navy-700 text-xl leading-tight">
          {room.title}
        </h3>
        {/* Building / floor — distinguishes rooms in the same project without
            exposing the internal room code. */}
        {(room.building || room.floor != null) && (
          <div className="mt-1 text-xs text-muted">
            {[room.building && `${UI.cardBuilding} ${room.building}`, room.floor != null && `${UI.cardFloor} ${room.floor}`].filter(Boolean).join(' · ')}
          </div>
        )}
        <div className="mt-4 flex items-center gap-5 text-sm text-muted">
          <span className="inline-flex items-center gap-1.5"><Bed size={16} /> {room.beds} {UI.cardBeds}</span>
          <span className="inline-flex items-center gap-1.5"><Bath size={16} /> {room.baths} {UI.cardBaths}</span>
          <span className="inline-flex items-center gap-1.5"><Ruler size={16} /> {room.sqm} {UI.cardSqm}</span>
        </div>
        <div className="mt-5 pt-5 border-t border-line flex items-center justify-between gap-3">
          <div>
            <span className="font-bold text-navy-700 text-2xl sm:text-3xl tabular-nums">
              ฿{Number(room.price).toLocaleString()}
            </span>
            <span className="text-sm text-muted"> {UI.cardPerMonth}</span>
          </div>
          <button
            type="button"
            className="btn btn-ember btn-sm"
            onClick={(e) => { e.stopPropagation(); onOpen?.(room) }}
          >
            {UI.cardViewRoom} <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </article>
  )
}
