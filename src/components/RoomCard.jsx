// src/components/RoomCard.jsx — shared card used by the landing listings grid
// AND (potentially) by SearchPage's list rows. Extracted so both callers get
// the same look without duplicating markup.

import { MapPin, Bed, Bath, Ruler, Clock, ArrowRight } from './icons.jsx'

const BADGE_TONE = {
  green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  ember: 'bg-ember-50 text-ember-700 border-ember-200',
  navy:  'bg-navy-50 text-navy-700 border-navy-200',
}

export function RoomCard({ room, onOpen }) {
  const tone = BADGE_TONE[room.badgeTone] || BADGE_TONE.ember
  return (
    <article
      className="card card-hover overflow-hidden group cursor-pointer"
      onClick={() => onOpen?.(room.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen?.(room.id) } }}
      aria-label={`ดูรายละเอียด ${room.title}`}
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
            {room.badge}
          </span>
        )}
      </div>
      <div className="p-6">
        <div className="flex items-center gap-1.5 text-sm font-medium text-muted">
          <MapPin size={14} /> {room.zone}
        </div>
        <h3 className="mt-2 font-bold text-navy-700 text-xl leading-tight">
          {room.title}
        </h3>
        <div className="mt-4 flex items-center gap-5 text-sm text-muted">
          <span className="inline-flex items-center gap-1.5"><Bed size={16} /> {room.beds} นอน</span>
          <span className="inline-flex items-center gap-1.5"><Bath size={16} /> {room.baths} น้ำ</span>
          <span className="inline-flex items-center gap-1.5"><Ruler size={16} /> {room.sqm} ตร.ม.</span>
        </div>
        <div className="mt-5 pt-5 border-t border-line flex items-center justify-between gap-3">
          <div>
            <span className="font-bold text-navy-700 text-2xl sm:text-3xl tabular-nums">
              ฿{Number(room.price).toLocaleString()}
            </span>
            <span className="text-sm text-muted"> / เดือน</span>
          </div>
          <button
            type="button"
            className="btn btn-ember btn-sm"
            onClick={(e) => { e.stopPropagation(); onOpen?.(room.id) }}
          >
            ดูห้อง <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </article>
  )
}
