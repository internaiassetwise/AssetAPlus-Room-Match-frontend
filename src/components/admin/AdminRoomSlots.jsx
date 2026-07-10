// src/components/admin/AdminRoomSlots.jsx — Open / cancel bookable viewing
// time-slots for a room. The Line bot then surfaces each open slot as a
// tappable button so tenants can request that viewing time.
//
// Backed by the existing endpoints:
//   GET    /api/rooms/:id/slots      -> [{ id, roomId, startsAt, status, ... }]
//   POST   /api/rooms/:id/slots      { startsAt }  -> the new slot
//   DELETE /api/rooms/slots/:id      -> 204

import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Clock, ChevronLeft } from '../icons.jsx'
import { ConfirmDialog } from '../Modal.jsx'
import { useApi } from '../../hooks/useApi.js'
import { api, ApiError } from '../../api/client.js'

// Bangkok-time formatting for a slot's startsAt ISO string.
function fmtBangkok(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return isNaN(d.getTime())
    ? iso
    : d.toLocaleString('th-TH', {
        timeZone: 'Asia/Bangkok',
        dateStyle: 'long',
        timeStyle: 'short',
      })
}

export default function AdminRoomSlots() {
  const { id } = useParams()
  // Room title (for the header) and the open slots list are separate reads.
  const { data: room } = useApi(() => api.getRoom(id), [id])
  const { data: slots, loading, error, refetch } = useApi(() => api.listRoomSlots(id), [id])

  const [startsAt, setStartsAt] = useState('')          // datetime-local value
  const [opening, setOpening] = useState(false)
  const [openError, setOpenError] = useState('')
  const [cancelling, setCancelling] = useState(null)    // slot object awaiting confirm
  const [busy, setBusy] = useState(false)               // in-flight cancel
  const [cancelError, setCancelError] = useState('')

  async function handleOpen(e) {
    e.preventDefault()
    setOpenError('')
    if (!startsAt) {
      setOpenError('กรุณาเลือกวันเวลาที่จะเปิดนัดชม')
      return
    }
    const iso = new Date(startsAt).toISOString()
    if (new Date(iso).getTime() <= Date.now()) {
      setOpenError('วันเวลาต้องเป็นอนาคต')
      return
    }
    setOpening(true)
    try {
      await api.openRoomSlot(id, iso)
      setStartsAt('')
      await refetch()
    } catch (err) {
      setOpenError(err instanceof ApiError ? err.message : 'เปิดเวลาไม่สำเร็จ')
    } finally {
      setOpening(false)
    }
  }

  async function doCancel() {
    if (!cancelling) return
    setBusy(true); setCancelError('')
    try {
      await api.cancelRoomSlot(cancelling.id)
      setCancelling(null)
      await refetch()
    } catch (err) {
      setCancelError(err instanceof ApiError ? err.message : 'ยกเลิกไม่สำเร็จ')
    } finally {
      setBusy(false)
    }
  }

  const list = Array.isArray(slots) ? slots : []

  return (
    <section>
      <div className="mb-7">
        <Link to="/admin" className="inline-flex items-center gap-1 text-sm text-muted hover:text-navy-700">
          <ChevronLeft size={14} /> กลับไปหน้าจัดการห้อง
        </Link>
        <span className="eyebrow-navy mt-3 block">เวลานัดชม</span>
        <h1 className="mt-3 font-bold text-navy-700 text-3xl sm:text-4xl tracking-tight">
          {room ? room.title : 'ห้อง'}
        </h1>
        <p className="mt-2 text-muted max-w-2xl">
          เปิดช่วงเวลาให้ผู้เช่านัดชมห้อง บอทจะแสดงแต่ละช่วงเวลาเป็นปุ่มให้ผู้เช่าแตะเพื่อเลือกนัดชม
        </p>
      </div>

      {/* เปิดเวลานัดชม */}
      <form onSubmit={handleOpen} className="card p-5 mb-6">
        <label className="label" htmlFor="slot-starts-at">เปิดเวลานัดชม</label>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <input
            id="slot-starts-at"
            type="datetime-local"
            className="input"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
          />
          <button type="submit" disabled={opening} className="btn btn-primary">
            <Clock size={16} />
            {opening ? 'กำลังเปิด…' : 'เปิดเวลานี้'}
          </button>
        </div>
        {openError && <p className="error mt-3">{openError}</p>}
      </form>

      {cancelError && (
        <div className="card p-4 text-ember-700 text-sm mb-4">{cancelError}</div>
      )}
      {error && (
        <div className="card p-6 text-ember-700 text-sm">โหลดข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง</div>
      )}

      {loading && <div className="card p-6 text-muted text-sm">กำลังโหลด…</div>}

      {!loading && !error && list.length === 0 && (
        <div className="card p-12 text-center text-muted">
          <div className="text-4xl mb-2">🗓️</div>
          <div className="text-sm">ยังไม่มีเวลาที่เปิดให้นัด</div>
        </div>
      )}

      <div className="space-y-3">
        {list.map((s) => (
          <div key={s.id} className="card p-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Clock size={18} className="text-navy-700 shrink-0" />
              <div className="font-semibold text-navy-700">{fmtBangkok(s.startsAt)}</div>
            </div>
            <button
              type="button"
              onClick={() => { setCancelError(''); setCancelling(s) }}
              className="btn btn-ghost btn-sm text-ember-700"
            >
              ยกเลิก
            </button>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={!!cancelling}
        title="ยกเลิกเวลานัดชมนี้?"
        message={cancelling ? `ยกเลิก "${fmtBangkok(cancelling.startsAt)}"? ผู้เช่าจะไม่สามารถเลือกช่วงเวลานี้นัดชมได้อีก` : ''}
        confirmLabel={busy ? 'กำลังยกเลิก…' : 'ยกเลิกเวลานี้'}
        confirmTone="danger"
        busy={busy}
        onCancel={() => { if (!busy) { setCancelling(null); setCancelError('') } }}
        onConfirm={doCancel}
      />
    </section>
  )
}
