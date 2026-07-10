// src/components/admin/AdminPendingListings.jsx — Approve / reject listings
// that landlords submitted through the Line chatbot (status='pending').
//
// The bot's createRoomDraft tool writes rooms at status='pending'; they stay
// invisible to tenants until an admin approves them here (→ 'available') or
// rejects them (→ 'removed'). Approving/rejecting also pushes a Line message
// back to the landlord who submitted it.

import { useState } from 'react'
import { Check, X } from '../icons.jsx'
import { ConfirmDialog } from '../Modal.jsx'
import { useApi } from '../../hooks/useApi.js'
import { api, ApiError } from '../../api/client.js'

const PROPERTY_LABEL = {
  condo: 'คอนโด', house: 'บ้าน', townhouse: 'ทาวน์เฮ้าส์', apartment: 'อพาร์ตเมนต์', studio: 'สตูดิโอ',
}

function fmtDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return isNaN(d.getTime()) ? iso : d.toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })
}

export default function AdminPendingListings() {
  const { data: rooms, loading, error, refetch } = useApi(() => api.listPendingListings(), [])
  const [actingId, setActingId] = useState(null)     // room id with an in-flight approve/reject
  const [rejecting, setRejecting] = useState(null)   // room object awaiting confirm
  const [actionError, setActionError] = useState('')

  async function approve(id) {
    setActingId(id); setActionError('')
    try {
      await api.approveListing(id)
      await refetch()
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'อนุมัติไม่สำเร็จ')
    } finally {
      setActingId(null)
    }
  }

  async function doReject() {
    if (!rejecting) return
    const id = rejecting.id
    setActingId(id); setActionError('')
    try {
      await api.rejectListing(id)
      setRejecting(null)
      await refetch()
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'ปฏิเสธไม่สำเร็จ')
    } finally {
      setActingId(null)
    }
  }

  const list = Array.isArray(rooms) ? rooms : []

  return (
    <section>
      <div className="mb-7">
        <span className="eyebrow-navy">รออนุมัติ</span>
        <h1 className="mt-3 font-bold text-navy-700 text-3xl sm:text-4xl tracking-tight">
          ประกาศที่รออนุมัติ {list.length > 0 && <span className="text-muted text-2xl">({list.length})</span>}
        </h1>
        <p className="mt-2 text-muted max-w-2xl">
          ประกาศที่ผู้ปล่อยเช่าส่งเข้ามาทางแชทบอท ยังไม่ขึ้นบนเว็บจนกว่าแอดมินจะกดอนุมัติ
          พออนุมัติ ห้องจะขึ้นให้ผู้เช่าเห็นและนัดชมได้ทันที และบอทจะแจ้งผู้ปล่อยเช่าผ่าน Line
        </p>
      </div>

      {actionError && (
        <div className="card p-4 text-ember-700 text-sm mb-4">{actionError}</div>
      )}
      {error && (
        <div className="card p-6 text-ember-700 text-sm">โหลดข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง</div>
      )}

      {loading && <div className="card p-6 text-muted text-sm">กำลังโหลด…</div>}

      {!loading && !error && list.length === 0 && (
        <div className="card p-12 text-center text-muted">
          <div className="text-4xl mb-2">✅</div>
          <div className="text-sm">ไม่มีประกาศที่รออนุมัติในตอนนี้</div>
        </div>
      )}

      <div className="space-y-4">
        {list.map((r) => (
          <div key={r.id} className="card overflow-hidden">
            <div className="flex flex-col sm:flex-row gap-4 p-5">
              {/* Image */}
              <div className="sm:w-40 h-32 sm:h-auto rounded-lg overflow-hidden bg-cream-100 shrink-0">
                {r.image
                  ? <img src={r.image} alt={r.title} className="w-full h-full object-cover" />
                  : <div className="w-full h-full grid place-items-center text-muted text-xs">ไม่มีรูป</div>}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h2 className="font-bold text-navy-700 text-lg">{r.title}</h2>
                  <span className="text-emerald-700 font-bold whitespace-nowrap">
                    ฿{Number(r.price ?? 0).toLocaleString('en-US')}<span className="text-muted font-normal text-sm">/เดือน</span>
                  </span>
                </div>
                <div className="mt-1 text-sm text-muted flex flex-wrap gap-x-3 gap-y-1">
                  <span>{PROPERTY_LABEL[r.propertyType] || r.propertyType}</span>
                  <span>·</span>
                  <span>{r.beds} ห้องนอน</span>
                  <span>·</span>
                  <span>{r.baths} ห้องน้ำ</span>
                  {r.sqm != null && (<><span>·</span><span>{r.sqm} ตร.ม.</span></>)}
                  <span>·</span>
                  <span>ย่าน{r.zone || '—'}</span>
                </div>
                {r.description && (
                  <p className="mt-2 text-sm text-navy-700 line-clamp-2 whitespace-pre-wrap">{r.description}</p>
                )}
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                  <span>ส่งเมื่อ {fmtDate(r.createdAt)}</span>
                  {r.createdByLineUserId && (
                    <span className="font-mono">จาก Line {r.createdByLineUserId.slice(0, 10)}…</span>
                  )}
                  <span>ห้อง #{r.id}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex sm:flex-col gap-2 sm:justify-start shrink-0">
                <button
                  type="button"
                  onClick={() => approve(r.id)}
                  disabled={actingId === r.id}
                  className="btn btn-primary btn-sm flex-1 sm:flex-none"
                >
                  <Check size={16} />
                  {actingId === r.id ? 'กำลังอนุมัติ…' : 'อนุมัติ'}
                </button>
                <button
                  type="button"
                  onClick={() => setRejecting(r)}
                  disabled={actingId === r.id}
                  className="btn btn-ghost btn-sm text-ember-700 flex-1 sm:flex-none"
                >
                  <X size={16} /> ปฏิเสธ
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={!!rejecting}
        title="ปฏิเสธประกาศนี้?"
        message={rejecting ? `ปฏิเสธ "${rejecting.title}"? ห้องจะถูกซ่อนจากเว็บ และบอทจะแจ้งผู้ปล่อยเช่าทาง Line` : ''}
        confirmLabel={actingId === rejecting?.id ? 'กำลังปฏิเสธ…' : 'ปฏิเสธ'}
        confirmTone="danger"
        busy={actingId === rejecting?.id}
        onCancel={() => !actingId && setRejecting(null)}
        onConfirm={doReject}
      />
    </section>
  )
}
