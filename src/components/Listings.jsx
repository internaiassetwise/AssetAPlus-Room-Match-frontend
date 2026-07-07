import { useState, useEffect } from 'react'
import { MapPin, Bed, Bath, Ruler, Clock, ArrowRight, Home } from './icons.jsx'
import RoomDetailModal from './RoomDetailModal.jsx'
import { useApi } from '../hooks/useApi.js'
import { api } from '../api/client.js'

const BADGE_TONE = {
  green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  ember: 'bg-ember-50 text-ember-700 border-ember-200',
  navy:  'bg-navy-50 text-navy-700 border-navy-200',
}

const MOCK_IMAGES = [
  '/images/room-navy.jpg',
  '/images/room-cloud.jpg',
  '/images/room-studio.jpg',
  '/images/room-modern.jpg',
  '/images/room-navy-2.jpg',
  '/images/room-bedroom-1.jpg',
  '/images/room-bedroom-2.jpg',
  '/images/rooftop-pool.jpg',
  '/images/hero-pool.jpg',
]

function hashId(id) {
  const s = String(id ?? '0')
  let n = 0
  for (let i = 0; i < s.length; i++) n = (n * 31 + s.charCodeAt(i)) >>> 0
  return n
}

function pickMockImage(room) {
  return MOCK_IMAGES[hashId(room.id ?? room.title) % MOCK_IMAGES.length]
}

function RoomCard({ room, onOpen }) {
  const tone = BADGE_TONE[room.badgeTone] || BADGE_TONE.ember
  const imgSrc = room.image || pickMockImage(room)
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
        <img
          src={imgSrc}
          alt={room.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = MOCK_IMAGES[0]
          }}
        />
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

function SkeletonCard() {
  return (
    <div className="card overflow-hidden">
      <div className="aspect-[4/3] bg-navy-50 animate-pulse" />
      <div className="p-6 space-y-3">
        <div className="h-4 w-20 bg-navy-100 rounded animate-pulse" />
        <div className="h-6 w-3/4 bg-navy-100 rounded animate-pulse" />
        <div className="h-5 w-1/2 bg-navy-100 rounded animate-pulse" />
      </div>
    </div>
  )
}

export default function Listings() {
  const [activeZone, setActiveZone] = useState(null)
  const [debouncedZone, setDebouncedZone] = useState(null)
  const [selectedRoomId, setSelectedRoomId] = useState(null)

  const { data: zones } = useApi(() => api.listZones(), [])
  const zonesDisplay = zones && zones.length ? zones : []

  useEffect(() => {
    const t = setTimeout(() => setDebouncedZone(activeZone), 250)
    return () => clearTimeout(t)
  }, [activeZone])

  const params = debouncedZone ? { zone: debouncedZone } : {}
  const { data: rooms, loading, error } = useApi(() => api.listRooms(params), [debouncedZone])

  const openRoom  = (id) => setSelectedRoomId(id)
  const closeRoom = ()  => setSelectedRoomId(null)

  return (
    <section id="listings" className="section bg-cream-50">
      <div className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
          <div>
            <span className="eyebrow">ห้องว่างพร้อมเข้าอยู่</span>
            <h2 className="mt-4 font-bold text-navy-700 text-4xl sm:text-5xl tracking-tight">
              ห้องที่<span className="text-ember-600"> Match</span> กับคุณ
            </h2>
          </div>
          <div className="inline-flex items-center gap-1.5 text-sm text-muted">
            <Clock size={16} className="text-navy-600" /> อัพเดททุกวัน
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5 mb-10">
          <button
            type="button"
            onClick={() => setActiveZone(null)}
            className={`chip ${activeZone === null ? 'chip-active' : ''}`}
          >
            ทั้งหมด
          </button>
          {zonesDisplay.map((z) => (
            <button
              type="button"
              key={z.id}
              onClick={() => setActiveZone(z.id)}
              className={`chip ${activeZone === z.id ? 'chip-active' : ''}`}
            >
              <MapPin size={14} /> {z.name}
              <span className="text-muted">({z.count})</span>
            </button>
          ))}
        </div>

        {error ? (
          <div className="text-center py-16 text-muted">
            โหลดข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(loading ? Array.from({ length: 6 }) : (rooms && rooms.length ? rooms : [])).map((r, i) =>
              loading ? <SkeletonCard key={i} /> : <RoomCard key={r.id} room={r} onOpen={openRoom} />,
            )}
          </div>
        )}

        <RoomDetailModal roomId={selectedRoomId} onClose={closeRoom} />

        {!loading && rooms && rooms.length === 0 && (
          <div className="text-center py-16">
            <div className="w-14 h-14 rounded-full bg-navy-50 grid place-items-center mx-auto text-navy-400">
              <Home size={26} />
            </div>
            <div className="mt-4 font-bold text-navy-700 text-lg">ยังไม่มีห้องในย่านนี้</div>
            <div className="text-muted text-base mt-1.5">ลองเลือกย่านอื่น หรือฝากห้องของคุณกับเรา</div>
          </div>
        )}

        <div className="text-center mt-14">
          <button className="btn btn-primary btn-lg">
            ดูห้องทั้งหมด <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </section>
  )
}