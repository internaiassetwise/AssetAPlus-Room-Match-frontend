// src/components/ListingsForPersona.jsx — shared listings+filter block used
// inside both tenant and landlord arms of the landing PersonaFlow section.
//
// Fetches rooms from /api/rooms with optional filters. Same RoomCard used by
// both arms so a landlord viewing the "what tenants see" preview gets the
// exact same visual.

import { useEffect, useState } from 'react'
import { MapPin, Home, Clock } from './icons.jsx'
import { useApi } from '../hooks/useApi.js'
import { api } from '../api/client.js'
import RoomDetailModal from './RoomDetailModal.jsx'
import { RoomCard } from './RoomCard.jsx'

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

export default function ListingsForPersona({ persona, eyebrow, titleA, titleAccent, titleB, searchLabel, lastUpdated }) {
  const [activeZone, setActiveZone] = useState(null)
  const [debouncedZone, setDebouncedZone] = useState(null)
  const [maxBudget, setMaxBudget] = useState('')
  const [bedrooms, setBedrooms] = useState('')
  const [selectedRoomId, setSelectedRoomId] = useState(null)

  const { data: zones } = useApi(() => api.listZones(), [])
  const zonesDisplay = zones && zones.length ? zones : []

  useEffect(() => {
    const t = setTimeout(() => setDebouncedZone(activeZone), 250)
    return () => clearTimeout(t)
  }, [activeZone])

  const params = {
    ...(debouncedZone ? { zone: debouncedZone } : {}),
    ...(maxBudget !== '' ? { maxRent: Number(maxBudget) } : {}),
    ...(bedrooms !== '' ? { bedrooms: Number(bedrooms) } : {}),
  }
  const { data: rooms, loading, error } = useApi(() => api.listRooms(params), [debouncedZone, maxBudget, bedrooms])

  // "อัพเดทล่าสุด" timestamp — render today, Thai style.
  const today = new Date()
  const thaiMonths = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม']
  const lastUpdatedText = `${today.getDate()} ${thaiMonths[today.getMonth()]} ${today.getFullYear() + 543}`

  const openRoom  = (id) => setSelectedRoomId(id)
  const closeRoom = ()  => setSelectedRoomId(null)

  const accent = persona === 'tenant' ? 'text-navy-600' : 'text-ember-600'
  const headerText = (
    <>
      {titleA}<span className={`${accent}`}>{titleAccent}</span>{titleB}
    </>
  )

  return (
    <section className="section bg-cream-50" id={`persona-listings-${persona}`}>
      <div className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <span className="eyebrow">{eyebrow}</span>
            <h2 className="mt-4 font-bold text-navy-700 text-3xl sm:text-4xl tracking-tight">
              {headerText}
            </h2>
          </div>
          <div className="inline-flex items-center gap-1.5 text-sm text-muted">
            <Clock size={16} className="text-navy-600" />
            {lastUpdated} <span className="font-semibold text-navy-700">{lastUpdatedText}</span>
          </div>
        </div>

        <div className="card p-5 mb-8">
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label className="label">{searchLabel}</label>
              <div className="flex flex-wrap gap-2">
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
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">ประเภทห้อง</label>
              <select className="input" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)}>
                <option value="">ทุกประเภท</option>
                <option value="1">1 ห้องนอน</option>
                <option value="2">2 ห้องนอน</option>
                <option value="3">3+ ห้องนอน</option>
              </select>
            </div>

            <div>
              <label className="label">งบสูงสุด (บาท)</label>
              <input
                inputMode="numeric"
                className="input"
                value={maxBudget}
                onChange={(e) => setMaxBudget(e.target.value)}
                placeholder="35000"
              />
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={() => { setActiveZone(null); setBedrooms(''); setMaxBudget('') }}
                className="text-xs text-muted hover:text-navy-700 underline w-full text-center py-2.5"
              >
                ล้างตัวกรอง
              </button>
            </div>
          </div>
        </div>

        {error ? (
          <div className="text-center py-16 text-muted">โหลดข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(loading ? Array.from({ length: 6 }) : (rooms && rooms.length ? rooms : [])).map((r, i) =>
              loading
                ? <SkeletonCard key={i} />
                : <RoomCard key={r.id} room={r} onOpen={openRoom} />,
            )}
          </div>
        )}

        <RoomDetailModal roomId={selectedRoomId} onClose={closeRoom} />

        {!loading && rooms && rooms.length === 0 && (
          <div className="text-center py-16">
            <div className="w-14 h-14 rounded-full bg-navy-50 grid place-items-center mx-auto text-navy-400">
              <Home size={26} />
            </div>
            <div className="mt-4 font-bold text-navy-700 text-lg">ยังไม่มีห้องในเงื่อนไขนี้</div>
            <div className="text-muted text-base mt-1.5">ลองปรับตัวกรอง หรือฝากความต้องการของคุณกับเรา</div>
          </div>
        )}
      </div>
    </section>
  )
}
