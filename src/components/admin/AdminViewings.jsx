// src/components/admin/AdminViewings.jsx — Confirm / decline tenant viewing
// requests that came in through the Line chatbot (status='requested').
//
// A tenant taps a bookable slot in Line → a viewing is created at 'requested'.
// It stays provisional until an admin confirms it here (→ 'confirmed', tenant
// is pushed a confirmation) or declines it (→ 'declined', the slot reopens for
// someone else, and the tenant is pushed a "pick another time" message).

import { useState } from 'react'
import { Check, X } from '../icons.jsx'
import { ConfirmDialog } from '../Modal.jsx'
import { useApi } from '../../hooks/useApi.js'
import { api, ApiError } from '../../api/client.js'

function fmtDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return isNaN(d.getTime()) ? iso : d.toLocaleString('th-TH', { dateStyle: 'long', timeStyle: 'short' })
}

export default function AdminViewings() {
  const { data: viewings, loading, error, refetch } = useApi(() => api.listAdminViewings(), [])
  const [actingId, setActingId] = useState(null)     // viewing id with an in-flight action
  const [declining, setDeclining] = useState(null)   // viewing object awaiting confirm
  const [actionError, setActionError] = useState('')

  async function confirm(id) {
    setActingId(id); setActionError('')
    try {
      await api.confirmViewing(id)
      await refetch()
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'ยืนยันไม่สำเร็จ')
    } finally {
      setActingId(null)
    }
  }

  async function doDecline() {
    if (!declining) return
    const id = declining.id
    setActingId(id); setActionError('')
    try {
      await api.declineViewing(id)
      setDeclining(null)
      await refetch()
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'ปฏิเสธไม่สำเร็จ')
    } finally {
      setActingId(null)
    }
  }

  const list = Array.isArray(viewings) ? viewings : []

  return (
    <section>
      <div className="mb-7">
        <span className="eyebrow-navy">นัดชมห้อง</span>
        <h1 className="mt-3 font-bold text-navy-700 text-3xl sm:text-4xl tracking-tight">
          นัดชมที่รอยืนยัน {list.length > 0 && <span className="text-muted text-2xl">({list.length})</span>}
        </h1>
        <p className="mt-2 text-muted max-w-2xl">
          ผู้เช่าจองเวลานัดชมผ่านแชทบอท รอแอดมินกดยืนยัน พอยืนยันแล้วบอทจะแจ้งผู้เช่าทาง Line
          หากปฏิเสธ เวลาที่จองจะเปิดให้คนอื่นจองใหม่ และบอทจะบอกผู้เช่าให้เลือกเวลาอื่น
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
          <div className="text-4xl mb-2">📅</div>
          <div className="text-sm">ไม่มีคำขอนัดชมที่รอยืนยันในตอนนี้</div>
        </div>
      )}

      <div className="space-y-4">
        {list.map((v) => (
          <div key={v.id} className="card overflow-hidden">
            <div className="flex flex-col sm:flex-row gap-4 p-5">
              {/* Image */}
              <div className="sm:w-40 h-32 sm:h-auto rounded-lg overflow-hidden bg-cream-100 shrink-0">
                {v.room?.image
                  ? <img src={v.room.image} alt={v.room.title} className="w-full h-full object-cover" />
                  : <div className="w-full h-full grid place-items-center text-muted text-xs">ไม่มีรูป</div>}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h2 className="font-bold text-navy-700 text-lg">{v.room?.title || 'ห้องเช่า'}</h2>
                  <span className="text-emerald-700 font-bold whitespace-nowrap">
                    ฿{Number(v.room?.rent ?? 0).toLocaleString('en-US')}<span className="text-muted font-normal text-sm">/เดือน</span>
                  </span>
                </div>
                <div className="mt-2 text-sm text-navy-700">
                  <span className="text-muted">เวลาที่นัด: </span>
                  <span className="font-semibold">{fmtDate(v.scheduledFor)}</span>
                </div>
                <div className="mt-1 text-sm text-muted">ย่าน{v.room?.zone || '—'}</div>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                  <span>ผู้เช่า: {v.tenant?.name || '—'}</span>
                  {v.tenant?.phone && <span>โทร {v.tenant.phone}</span>}
                  {v.tenant?.lineId && (
                    <span className="font-mono">Line {String(v.tenant.lineId).slice(0, 10)}…</span>
                  )}
                  <span>นัดชม #{v.id}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex sm:flex-col gap-2 sm:justify-start shrink-0">
                <button
                  type="button"
                  onClick={() => confirm(v.id)}
                  disabled={actingId === v.id}
                  className="btn btn-primary btn-sm flex-1 sm:flex-none"
                >
                  <Check size={16} />
                  {actingId === v.id ? 'กำลังยืนยัน…' : 'ยืนยัน'}
                </button>
                <button
                  type="button"
                  onClick={() => setDeclining(v)}
                  disabled={actingId === v.id}
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
        open={!!declining}
        title="ปฏิเสธคำขอนัดชมนี้?"
        message={declining
          ? `ปฏิเสธนัดชม "${declining.room?.title}" (${fmtDate(declining.scheduledFor)})? เวลานี้จะเปิดให้จองใหม่ และบอทจะบอกผู้เช่าให้เลือกเวลาอื่น`
          : ''}
        confirmLabel={actingId === declining?.id ? 'กำลังปฏิเสธ…' : 'ปฏิเสธ'}
        confirmTone="danger"
        busy={actingId === declining?.id}
        onCancel={() => !actingId && setDeclining(null)}
        onConfirm={doDecline}
      />
    </section>
  )
}
