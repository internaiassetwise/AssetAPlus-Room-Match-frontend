import { useNavigate } from 'react-router-dom'
import { MapPin, Bed, Bath, Ruler, Phone, ArrowRight, Home, Sparkles } from './icons.jsx'
import Modal from './Modal.jsx'
import { useApi } from '../hooks/useApi.js'
import { api } from '../api/client.js'

const FALLBACK_IMAGE = '/images/room-navy.jpg'

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl bg-navy-50 border border-navy-100 p-4">
      <div className="flex items-center gap-2 text-muted text-sm font-medium">
        <Icon size={16} className="text-navy-600" /> {label}
      </div>
      <div className="mt-1.5 font-bold text-navy-700 text-lg tabular-nums">{value}</div>
    </div>
  )
}

export default function RoomDetailModal({ roomId, onClose }) {
  const navigate = useNavigate()
  const { data: room, loading, error } = useApi(
    () => api.getRoom(roomId),
    [roomId],
  )

  const open = Boolean(roomId)
  const title = room?.title || 'กำลังโหลด…'

  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-2xl">
      {loading && (
        <div className="p-10 text-center text-muted">กำลังโหลดข้อมูลห้อง…</div>
      )}

      {error && (
        <div className="p-10 text-center">
          <div className="font-bold text-navy-700 text-lg">โหลดข้อมูลไม่สำเร็จ</div>
          <div className="text-muted text-base mt-1.5">กรุณาลองใหม่อีกครั้ง</div>
        </div>
      )}

      {room && (
        <div className="animate-fade-up max-h-[85vh] overflow-y-auto">
          {/* Image */}
          <div className="relative aspect-[16/9] bg-cream-100 overflow-hidden">
            <img
              src={room.image || FALLBACK_IMAGE}
              alt={room.title}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE }}
            />
            {room.badge && (
              <span className="absolute top-4 left-4 inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full bg-ember-500 text-white shadow-ember">
                {room.badge}
              </span>
            )}
          </div>

          {/* Body */}
          <div className="p-6 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-sm font-medium text-muted">
                  <MapPin size={14} /> {room.zone}
                </div>
                <h3 className="mt-2 font-bold text-navy-700 text-2xl sm:text-3xl tracking-tight">
                  {room.title}
                </h3>
              </div>
              <div className="text-right shrink-0">
                <div className="font-bold text-navy-700 text-3xl sm:text-4xl tabular-nums leading-none">
                  ฿{Number(room.price).toLocaleString()}
                </div>
                <div className="text-sm text-muted mt-1">/ เดือน</div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Stat icon={Bed}   label="ห้องนอน"     value={`${room.beds} ห้อง`} />
              <Stat icon={Bath}  label="ห้องน้ำ"      value={`${room.baths} ห้อง`} />
              <Stat icon={Ruler} label="ขนาด"        value={`${room.sqm} ตร.ม.`} />
              <Stat icon={Home}  label="ประเภท"      value={room.propertyType || 'คอนโด'} />
            </div>

            {room.description && (
              <p className="mt-6 text-navy-700 text-[15px] leading-relaxed">
                {room.description}
              </p>
            )}

            {room.amenities && room.amenities.length > 0 && (
              <div className="mt-6">
                <div className="text-sm font-semibold text-navy-700 mb-2.5">สิ่งอำนวยความสะดวก</div>
                <div className="flex flex-wrap gap-2">
                  {room.amenities.map((a) => (
                    <span key={a} className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-700 bg-navy-50 border border-navy-100 rounded-full px-3 py-1.5">
                      <Sparkles size={12} className="text-ember-500" /> {a}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => { onClose?.(); navigate(`/rooms/${room.id}`) }}
                className="btn btn-primary btn-lg"
              >
                ดูห้องเต็ม <ArrowRight size={18} />
              </button>
              <a href="tel:021680000" className="btn btn-outline btn-lg">
                <Phone size={18} /> 02-168-0000
              </a>
            </div>
          </div>
        </div>
      )}
    </Modal>
  )
}