// src/components/ListingsForPersona.jsx — shared listings+filter block used
// inside both tenant and landlord arms of the landing PersonaFlow section.
//
// Annotation #11: brief page 4 — zone chip "ค้นหา" row + "ตัวกรอง" dropdown.
// Dropdown reveals ทำเล / ประเภทห้อง / งบขั้นต่ำ / งบสูงสุด + Apply button.
// Eyebrow + title swapped to "ห้องว่างพร้อมอยู่" + "ห้องในระบบ ตอนนี้".

import { useEffect, useState } from 'react'
import { MapPin, Home, Clock, Search, Filter, ChevronDown, X } from './icons.jsx'
import { useApi } from '../hooks/useApi.js'
import { api } from '../api/client.js'
import RoomDetailModal from './RoomDetailModal.jsx'
import { RoomCard } from './RoomCard.jsx'
import { LISTINGS_SECTION } from '../data/content.js'

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

export default function ListingsForPersona({ persona, theme }) {
  const copy = LISTINGS_SECTION[persona]

  const [activeZone, setActiveZone]         = useState(null)
  const [debouncedZone, setDebouncedZone]   = useState(null)
  const [maxBudget, setMaxBudget]           = useState('')
  const [minBudget, setMinBudget]           = useState('')
  const [bedrooms, setBedrooms]             = useState('')
  const [propertyType, setPropertyType]     = useState('')
  const [showFilters, setShowFilters]       = useState(false)
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
    ...(minBudget !== '' ? { minRent: Number(minBudget) } : {}),
    ...(bedrooms !== '' ? { bedrooms: Number(bedrooms) } : {}),
    ...(propertyType ? { propertyType } : {}),
  }
  const { data: rooms, loading, error } = useApi(() => api.listRooms(params), [debouncedZone, maxBudget, minBudget, bedrooms, propertyType])

  // "อัพเดทล่าสุด" timestamp — render today, Thai style.
  const today = new Date()
  const thaiMonths = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม']
  const lastUpdatedText = `${today.getDate()} ${thaiMonths[today.getMonth()]} ${today.getFullYear() + 543}`

  const openRoom  = (id) => setSelectedRoomId(id)
  const closeRoom = ()  => setSelectedRoomId(null)

  const accent = persona === 'tenant' ? 'text-navy-600' : 'text-ember-600'
  const headerText = (
    <>
      {copy.titleA}<span className={`${accent}`}>{copy.titleAccent}</span>{copy.titleB}
    </>
  )

  const clearAll = () => {
    setActiveZone(null); setMaxBudget(''); setMinBudget(''); setBedrooms(''); setPropertyType('')
  }

  return (
    <section className="section bg-transparent" id={`persona-listings-${persona}`}>
      <div className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <span className={`eyebrow ${persona === 'tenant' ? '' : 'eyebrow-navy'}`}>
              {copy.eyebrow}
            </span>
            <h2 className="mt-4 font-bold text-navy-700 text-3xl sm:text-4xl tracking-tight">
              {headerText}
            </h2>
          </div>
          <div className="inline-flex items-center gap-1.5 text-sm text-muted">
            <Clock size={16} className="text-navy-600" />
            {copy.lastUpdated} <span className="font-semibold text-navy-700">{lastUpdatedText}</span>
          </div>
        </div>

        {/* Search + filter buttons row (annotation #11) */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-[240px]">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
            <input
              type="search"
              className="input pl-10"
              placeholder="ค้นหา เช่น ลาดพร้าว, สตูดิโอ..."
              aria-label="ค้นหาห้อง"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-outline btn-sm inline-flex items-center gap-1.5"
            aria-expanded={showFilters}
          >
            <Filter size={16} /> ตัวกรอง
            <ChevronDown size={14} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
          {(activeZone || maxBudget || minBudget || bedrooms || propertyType) && (
            <button
              type="button"
              onClick={clearAll}
              className="text-xs text-muted hover:text-navy-700 inline-flex items-center gap-1"
            >
              <X size={14} /> ล้างตัวกรอง
            </button>
          )}
        </div>

        {/* Filter dropdown panel */}
        {showFilters && (
          <div className="card p-5 mb-6 border-navy-200">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="label">ทำเล</label>
                <select className="input" value={activeZone || ''} onChange={(e) => setActiveZone(e.target.value || null)}>
                  <option value="">ทั้งหมด</option>
                  {zonesDisplay.map((z) => (
                    <option key={z.id} value={z.slug}>{z.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">ประเภทห้อง</label>
                <select className="input" value={propertyType} onChange={(e) => setPropertyType(e.target.value)}>
                  <option value="">ทุกประเภท</option>
                  <option value="studio">Studio</option>
                  <option value="1bed">1 ห้องนอน</option>
                  <option value="1bed_multi">1 ห้องนอน + ห้องเอนกประสงค์</option>
                  <option value="2bed">2 ห้องนอน</option>
                </select>
              </div>
              <div>
                <label className="label">งบขั้นต่ำ (บาท)</label>
                <input
                  inputMode="numeric"
                  className="input"
                  value={minBudget}
                  onChange={(e) => setMinBudget(e.target.value)}
                  placeholder="10000"
                />
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
            </div>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowFilters(false)}
                className="btn btn-navy btn-sm"
              >
                Apply
              </button>
            </div>
          </div>
        )}

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