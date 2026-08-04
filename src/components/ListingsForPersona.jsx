// src/components/ListingsForPersona.jsx — shared listings+filter block used
// inside both tenant and landlord arms of the landing PersonaFlow section.
//
// Annotation #11: brief page 4 — zone chip "ค้นหา" row + "ตัวกรอง" dropdown.
// Dropdown reveals ทำเล / ประเภทห้อง / งบขั้นต่ำ / งบสูงสุด + Apply button.
// Eyebrow + title swapped to "ห้องว่างพร้อมอยู่" + "ห้องในระบบ ตอนนี้".

import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Home, Clock, Search, Filter, ChevronDown, X, Check } from './icons.jsx'
import { useApi } from '../hooks/useApi.js'
import { useSearchParams } from 'react-router-dom'
import { api } from '../api/client.js'
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

  // Filters live in the URL, not in component state alone. A filtered view is
  // something admins send to a customer ("here are the 3 rooms in ศาลายา under
  // 15k") and something a customer wants to bookmark or come back to via the
  // back button — none of which worked while the filters were invisible to the
  // address bar.
  const [sp, setSp] = useSearchParams()
  const activeZone   = sp.get('zone') || null
  const maxBudget    = sp.get('max')  || ''
  const minBudget    = sp.get('min')  || ''
  const bedrooms     = sp.get('beds') || ''
  const propertyType = sp.get('type') || ''
  const project      = sp.get('project') || ''

  /** Write one filter to the URL. Empty/null removes the key so links stay clean. */
  const setFilter = (key, value) => {
    setSp((prev) => {
      const next = new URLSearchParams(prev)
      if (value === '' || value === null || value === undefined) next.delete(key)
      else next.set(key, String(value))
      return next
    }, { replace: true })   // replace: typing in a budget box shouldn't fill history
  }
  const setActiveZone   = (v) => setFilter('zone', v)
  const setMaxBudget    = (v) => setFilter('max',  v)
  const setMinBudget    = (v) => setFilter('min',  v)
  const setBedrooms     = (v) => setFilter('beds', v)
  const setPropertyType = (v) => setFilter('type', v)

  const [debouncedZone, setDebouncedZone]   = useState(null)
  const [showFilters, setShowFilters]       = useState(false)
  const [copiedLink, setCopiedLink]         = useState(false)

  const hasFilters = Boolean(activeZone || maxBudget || minBudget || bedrooms || propertyType || project)

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    } catch {
      // clipboard is blocked outside a secure context / without permission —
      // select the URL so the user can copy it by hand rather than nothing.
      window.prompt('คัดลอกลิงก์นี้', window.location.href)
    }
  }
  const navigate = useNavigate()

  const { data: zones } = useApi(() => api.listZones(), [])
  const zonesDisplay = zones && zones.length ? zones : []

  // The API filters by zone SLUG, but a shared link may carry the Thai name —
  // that is what the admin rooms table displays and what reads sensibly in a
  // URL someone forwards. Accept either and resolve to the slug, otherwise the
  // link opens to an empty result and looks like we have nothing available.
  const zoneSlug = useMemo(() => {
    if (!activeZone) return null
    const v = String(activeZone).trim().toLowerCase()
    const hit = zonesDisplay.find((z) =>
      String(z.slug || '').toLowerCase() === v || String(z.name || '').toLowerCase() === v)
    return hit?.slug ?? activeZone
  }, [activeZone, zonesDisplay])

  useEffect(() => {
    const t = setTimeout(() => setDebouncedZone(zoneSlug), 250)
    return () => clearTimeout(t)
  }, [zoneSlug])

  const params = {
    ...(debouncedZone ? { zone: debouncedZone } : {}),
    ...(maxBudget !== '' ? { maxRent: Number(maxBudget) } : {}),
    ...(minBudget !== '' ? { minRent: Number(minBudget) } : {}),
    ...(bedrooms !== '' ? { bedrooms: Number(bedrooms) } : {}),
    ...(propertyType ? { roomType: propertyType } : {}),
    ...(project ? { project } : {}),
  }
  const { data: rooms, loading, error } = useApi(() => api.listRooms(params), [debouncedZone, maxBudget, minBudget, bedrooms, propertyType, project])

  // "อัพเดทล่าสุด" timestamp — render today, Thai style.
  const today = new Date()
  const thaiMonths = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม']
  const lastUpdatedText = `${today.getDate()} ${thaiMonths[today.getMonth()]} ${today.getFullYear() + 543}`

  // Clicking a room card goes straight to its detail page (no intermediate
  // modal). Hand the room object along as router state so the detail page can
  // render instantly instead of flashing a loading screen.
  const openRoom = (room) => navigate(`/rooms/${room.id}`, { state: { room } })

  const accent = persona === 'tenant' ? 'text-navy-600' : 'text-ember-600'
  const headerText = (
    <>
      {copy.titleA}<span className={`${accent}`}>{copy.titleAccent}</span>{copy.titleB}
    </>
  )

  const clearAll = () => {
    // One write, not five: each setFilter reads the CURRENT params, so five
    // calls in a row would all start from the same snapshot and only the last
    // would land — the other four filters would silently stay applied.
    setSp((prev) => {
      const next = new URLSearchParams(prev)
      for (const k of ['zone', 'max', 'min', 'beds', 'type', 'project']) next.delete(k)
      return next
    }, { replace: true })
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
          {hasFilters && (
            <>
              {/* Now that the filters live in the URL, the current view IS a
                  link — this just saves admins selecting the address bar on a
                  phone, which is the whole reason they couldn't share it. */}
              <button
                type="button"
                onClick={copyLink}
                className="btn btn-outline btn-sm inline-flex items-center gap-1.5"
                aria-label="คัดลอกลิงก์ผลการค้นหานี้"
              >
                {copiedLink ? <>คัดลอกแล้ว <Check size={14} /></> : <>คัดลอกลิงก์</>}
              </button>
              <button
                type="button"
                onClick={clearAll}
                className="text-xs text-muted hover:text-navy-700 inline-flex items-center gap-1"
              >
                <X size={14} /> ล้างตัวกรอง
              </button>
            </>
          )}
        </div>

        {/* Filter dropdown panel */}
        {showFilters && (
          <div className="card p-5 mb-6 border-navy-200">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="label">ทำเล</label>
                <select className="input" value={zoneSlug || ''} onChange={(e) => setActiveZone(e.target.value || null)}>
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
                  <option value="STUDIO">STUDIO</option>
                  <option value="1 BEDROOM">1 BEDROOM</option>
                  <option value="1 BEDROOM EXCLUSIVE">1 BEDROOM EXCLUSIVE</option>
                  <option value="1 BEDROOM EXTRA">1 BEDROOM EXTRA</option>
                  <option value="1 BEDROOM PLUS">1 BEDROOM PLUS</option>
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