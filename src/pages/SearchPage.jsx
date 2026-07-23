// src/pages/SearchPage.jsx — Full search experience: filters + list/map split.

import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useApi } from '../hooks/useApi.js'
import { api } from '../api/client.js'
import { useUserAuth } from '../contexts/UserAuthContext.jsx'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import MapView from '../components/MapView.jsx'
import { Search, Map, Compass, Bed, Bath } from '../components/icons.jsx'

const PROPERTY_TYPES = ['condo', 'house', 'townhouse', 'apartment', 'studio']

export default function SearchPage() {
  const [view, setView]   = useState('split')              // list | map | split
  const [zone, setZone]   = useState('')
  const [type, setType]   = useState('')
  const [minRent, setMin] = useState('')
  const [maxRent, setMax] = useState('')
  const [bedrooms, setBd] = useState('')
  const [bounds, setB]   = useState(null)                  // [swLat,swLng,neLat,neLng]

  const params = useMemo(() => {
    const p = { zone: zone || undefined, type: type || undefined }
    if (minRent !== '') p.minRent = Number(minRent)
    if (maxRent !== '') p.maxRent = Number(maxRent)
    if (bounds) p.bounds = bounds.join(',')
    return p
  }, [zone, type, minRent, maxRent, bounds])

  const zones = useApi(() => api.listZones(), [])
  const { data: rooms } = useApi(() => api.listRooms(params), [params])

  function clear() {
    setZone(''); setType(''); setMin(''); setMax(''); setBd(''); setB(null)
  }

  // Auto-pick room id for the marker pulse effect (future use; harmless no-op now).
  const [pickedId, setPickedId] = useState(null)

  return (
    <>
      <Navbar />

      <main className="container-page py-10">
        <header className="mb-7">
          <span className="eyebrow-navy">
            <Search size={14} /> ค้นหาห้อง
          </span>
          <h1 className="mt-3 text-3xl sm:text-4xl font-bold text-navy-700">
            ห้องที่ใช่<span className="text-ember-600"> ในงบคุณ</span>
          </h1>
          <p className="mt-2 text-muted">กรองตามทำเล ราคา ประเภทห้อง หรือแผนที่</p>
        </header>

        {/* Filter bar */}
        <section className="card p-5 mb-7 grid gap-5 lg:grid-cols-[1fr_auto] items-end">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <FilterField label="ทำเล">
              <select className="input" value={zone} onChange={(e) => setZone(e.target.value)}>
                <option value="">ทุกทำเล</option>
                {(zones.data || []).map((z) => (
                  <option key={z.slug} value={z.slug}>{z.name_th}</option>
                ))}
              </select>
            </FilterField>
            <FilterField label="ประเภทห้อง">
              <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
                <option value="">ทุกประเภท</option>
                <option value="STUDIO">STUDIO</option>
                <option value="1 BEDROOM">1 BEDROOM</option>
                <option value="1 BEDROOM EXCLUSIVE">1 BEDROOM EXCLUSIVE</option>
                <option value="1 BEDROOM EXTRA">1 BEDROOM EXTRA</option>
                <option value="1 BEDROOM PLUS">1 BEDROOM PLUS</option>
              </select>
            </FilterField>
            <FilterField label="ห้องนอน">
              <div className="flex gap-2">
                {[1, 2, 3].map((n) => (
                  <button key={n} type="button" onClick={() => setBd(bd => bd === n ? '' : n)}
                          className={`chip flex-1 justify-center ${bedrooms === n ? 'chip-active' : ''}`}>
                    {n}+
                  </button>
                ))}
              </div>
            </FilterField>
            <FilterField label="งบขั้นต่ำ (฿)">
              <input inputMode="numeric" className="input" value={minRent} onChange={(e) => setMin(e.target.value)} placeholder="10000" />
            </FilterField>
            <FilterField label="งบสูงสุด (฿)">
              <input inputMode="numeric" className="input" value={maxRent} onChange={(e) => setMax(e.target.value)} placeholder="35000" />
            </FilterField>
          </div>
          <div className="flex flex-col gap-2">
            <div className="inline-flex rounded-lg border border-navy-100 p-1 bg-navy-50/50">
              <ViewToggle current={view} value="split" onClick={setView}>ทั้งสอง</ViewToggle>
              <ViewToggle current={view} value="list" onClick={setView}>ลิสต์</ViewToggle>
              <ViewToggle current={view} value="map" onClick={setView}>แผนที่</ViewToggle>
            </div>
            <button onClick={clear} className="text-xs text-muted hover:text-navy-700 underline">
              ล้างตัวกรอง
            </button>
          </div>
        </section>

        {/* Count + list/map split */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-muted">
            พบ <span className="font-semibold text-navy-700">{rooms?.length ?? '…'}</span> ห้อง
          </div>
        </div>

        <div className={`grid gap-6 ${view === 'split' ? 'lg:grid-cols-[1fr_1.1fr]' : ''}`}>
          {(view === 'list' || view === 'split') && (
            <RoomList rooms={rooms} pickedId={pickedId} />
          )}
          {(view === 'map' || view === 'split') && (
            <MapView
              rooms={rooms || []}
              fitToRooms
              onMarkerClick={(r) => setPickedId(r.id)}
              onBoundsChange={(b) => setB([
                b.getSouth(), b.getWest(), b.getNorth(), b.getEast(),
              ])}
              height={view === 'map' ? 640 : 560}
            />
          )}
        </div>
      </main>

      <Footer />
    </>
  )
}

function FilterField({ label, children }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  )
}

function ViewToggle({ current, value, onClick, children }) {
  const active = current === value
  return (
    <button type="button" onClick={() => onClick(value)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${active ? 'bg-white text-navy-700 shadow-soft' : 'text-muted hover:text-navy-700'}`}>
      {children}
    </button>
  )
}

function RoomList({ rooms, pickedId }) {
  if (!rooms) return <div className="text-muted text-sm py-10 text-center">กำลังโหลด…</div>
  if (!rooms.length) return <div className="card p-10 text-center text-muted">ไม่พบห้องที่ตรงตัวกรอง ลองปรับเงื่อนไขอีกครั้ง</div>

  return (
    <div className="space-y-4">
      {rooms.map((r) => (
        <RoomRow key={r.id} room={r} active={r.id === pickedId} />
      ))}
    </div>
  )
}

function RoomRow({ room, active }) {
  return (
    <Link
      to={`/rooms/${room.id}`}
      className={`card card-hover overflow-hidden flex ${active ? 'ring-2 ring-navy-600' : ''}`}
    >
      {room.image_url && (
        <img src={room.image_url} alt="" className="w-32 sm:w-44 h-auto object-cover shrink-0" />
      )}
      <div className="p-4 sm:p-5 flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="font-semibold text-navy-700 truncate">{room.title}</div>
            <div className="text-sm text-muted truncate">{room.zone_name_th}</div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-navy-700 font-bold">฿{Number(room.monthly_rent).toLocaleString()}</div>
            <div className="text-[11px] text-muted">/ เดือน</div>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-3 text-xs text-muted">
          <span className="inline-flex items-center gap-1"><Bed size={12} /> {room.bedrooms}</span>
          <span className="inline-flex items-center gap-1"><Bath size={12} /> {room.bathrooms}</span>
          <span>{Number(room.size_sqm).toFixed(0)} ตร.ม.</span>
        </div>
      </div>
    </Link>
  )
}