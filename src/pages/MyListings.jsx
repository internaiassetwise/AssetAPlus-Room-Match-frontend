// src/pages/MyListings.jsx — Landlord's own room inventory.
//
// Tenant OR landlord can view their own rooms. Lists status badges,
// edit/delete buttons, and an "เพิ่มห้อง" CTA.

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import DevMockBanner from '../components/DevMockBanner.jsx'
import { useApi } from '../hooks/useApi.js'
import { api } from '../api/client.js'
import { useUserAuth } from '../contexts/UserAuthContext.jsx'
import { Home, Plus, Pencil, Trash, Eye } from '../components/icons.jsx'

const STATUS_LABEL = {
  available: 'ว่าง',
  reserved:  'จองแล้ว',
  matched:   'แมตช์แล้ว',
  inactive:  'ปิด',
}
const STATUS_STYLES = {
  available: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  reserved:  'bg-amber-50 text-amber-700 border-amber-200',
  matched:   'bg-navy-50 text-navy-700 border-navy-200',
  inactive:  'bg-rose-50 text-rose-700 border-rose-200',
}

export default function MyListings() {
  const navigate = useNavigate()
  const { user, loading } = useUserAuth()
  const { data: rooms, loading: rmLoading, error, reload } = useApi(
    () => api.listMyListings(),
    []
  )
  const [busyId, setBusyId] = useState(null)

  async function remove(id) {
    if (!confirm('ลบห้องนี้? การกระทำนี้ไม่สามารถยกเลิกได้')) return
    setBusyId(id)
    try { await api.deleteMyListing(id); reload() } finally { setBusyId(null) }
  }

  if (loading) return null  // Wait for auth check before redirecting.

  return (
    <>
      <DevMockBanner />
      <Navbar />
      <main className="container-page py-10">
        <header className="flex items-center justify-between gap-4 mb-7">
          <div>
            <span className="eyebrow-navy"><Home size={14} /> ห้องของฉัน</span>
            <h1 className="mt-3 text-3xl sm:text-4xl font-bold text-navy-700">
              ห้องที่คุณ<span className="text-ember-600"> ปล่อยเช่า</span>
            </h1>
            <p className="mt-2 text-muted">จัดการห้องทั้งหมดในที่เดียว</p>
          </div>
          <button onClick={() => navigate('/my-listings/new')} className="btn btn-primary">
            <Plus size={16} /> เพิ่มห้อง
          </button>
        </header>

        {rmLoading && <div className="text-muted text-center py-10">กำลังโหลด…</div>}
        {error && <div className="card p-6 text-ember-700">{error.message}</div>}
        {rooms && rooms.length === 0 && (
          <EmptyState />
        )}
        {rooms && rooms.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {rooms.map((r) => (
              <RoomCard
                key={r.id} room={r}
                onEdit={() => navigate(`/my-listings/${r.id}/edit`)}
                onDelete={() => remove(r.id)}
                busy={busyId === r.id}
              />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}

function EmptyState() {
  return (
    <div className="card p-10 text-center">
      <div className="w-16 h-16 rounded-full bg-navy-50 grid place-items-center mx-auto">
        <Home size={28} className="text-navy-600" />
      </div>
      <h3 className="mt-5 text-lg font-semibold text-navy-700">ยังไม่มีห้อง</h3>
      <p className="mt-2 text-muted">เพิ่มห้องแรกของคุณเพื่อเริ่มรับผู้สนใจ</p>
      <Link to="/my-listings/new" className="mt-6 btn btn-primary inline-flex">
        <Plus size={16} /> เพิ่มห้องแรก
      </Link>
    </div>
  )
}

function RoomCard({ room, onEdit, onDelete, busy }) {
  return (
    <article className="card card-hover overflow-hidden flex flex-col">
      {room.image_url && (
        <div className="aspect-[16/10] overflow-hidden bg-cream-50">
          <img src={room.image_url} alt="" className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="font-semibold text-navy-700 truncate">{room.title}</div>
            <div className="text-sm text-muted truncate">{room.zone_name_th}</div>
          </div>
          <span className={`text-[11px] font-semibold uppercase tracking-wider border rounded-full px-2 py-0.5 shrink-0 ${STATUS_STYLES[room.status] || ''}`}>
            {STATUS_LABEL[room.status] || room.status}
          </span>
        </div>
        <div className="mt-3 flex items-center gap-3 text-xs text-muted">
          <span>{room.bedrooms} นอน</span>
          <span>{room.bathrooms} น้ำ</span>
          <span>{Number(room.size_sqm).toFixed(0)} ตร.ม.</span>
        </div>
        <div className="mt-auto pt-4 flex items-center justify-between">
          <div className="text-navy-700 font-bold">฿{Number(room.monthly_rent).toLocaleString()}<span className="text-xs font-normal text-muted">/เดือน</span></div>
          <div className="flex gap-1.5">
            <Link to={`/rooms/${room.id}`} className="btn btn-ghost btn-sm" aria-label="ดู">
              <Eye size={14} />
            </Link>
            <button onClick={onEdit} className="btn btn-ghost btn-sm" aria-label="แก้ไข">
              <Pencil size={14} />
            </button>
            <button onClick={onDelete} disabled={busy} className="btn btn-ghost btn-sm text-ember-700 disabled:opacity-50" aria-label="ลบ">
              <Trash size={14} />
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}