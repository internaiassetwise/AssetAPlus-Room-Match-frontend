// src/components/ViewingCard.jsx — Single viewing row used on /viewings.
//
// Renders date/time, status pill, optional note, and context-aware action
// buttons (landlord: confirm/decline, tenant: cancel).

import { useState } from 'react'
import { Calendar, MapPin, Check, X } from './icons.jsx'
import { api, ApiError } from '../api/client.js'

const STATUS_LABEL = {
  requested: 'รอยืนยัน',
  confirmed: 'ยืนยันแล้ว',
  declined:  'ปฏิเสธ',
  completed: 'เสร็จสิ้น',
  cancelled: 'ยกเลิก',
}

const STATUS_STYLES = {
  requested: 'bg-amber-50 text-amber-700 border-amber-200',
  confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  declined:  'bg-rose-50 text-rose-700 border-rose-200',
  completed: 'bg-navy-50 text-navy-700 border-navy-200',
  cancelled: 'bg-navy-50 text-navy-500 border-navy-200',
}

function fmt(dt) {
  if (!dt) return '-'
  const d = new Date(dt)
  return d.toLocaleString('th-TH', {
    weekday: 'short', day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function ViewingCard({ viewing, role, onUpdate }) {
  const [busy, setBusy]   = useState(false)
  const [error, setError] = useState('')

  async function patch(body) {
    setBusy(true); setError('')
    try {
      const updated = await api.updateViewing(viewing.id, body)
      onUpdate?.(updated)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'อัปเดตไม่สำเร็จ')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="card p-5">
      <div className="flex items-start gap-4">
        {viewing.room_image && (
          <img src={viewing.room_image} alt="" className="w-20 h-20 rounded-lg object-cover shrink-0" />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[11px] font-semibold uppercase tracking-wider border rounded-full px-2 py-0.5 ${STATUS_STYLES[viewing.status] || ''}`}>
              {STATUS_LABEL[viewing.status] || viewing.status}
            </span>
            <span className="text-xs text-muted">#{viewing.id}</span>
          </div>
          <div className="mt-2 font-semibold text-navy-700 truncate">{viewing.room_title}</div>
          <div className="mt-1 flex items-center gap-3 text-sm text-muted">
            <span className="inline-flex items-center gap-1.5">
              <Calendar size={14} /> {fmt(viewing.scheduled_for)}
            </span>
            {viewing.zone_name_th && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={14} /> {viewing.zone_name_th}
              </span>
            )}
          </div>
          {role === 'landlord' && viewing.tenant_name && (
            <div className="mt-1.5 text-sm text-navy-700">
              <span className="text-muted">ผู้นัด:</span> {viewing.tenant_name}
              {viewing.tenant_phone && <span className="text-muted"> · {viewing.tenant_phone}</span>}
            </div>
          )}
          {viewing.note && (
            <div className="mt-2 text-sm text-navy-700 bg-cream-50 rounded-lg px-3 py-2 border border-line">
              <span className="text-xs font-semibold text-muted">หมายเหตุจากผู้นัด:</span> {viewing.note}
            </div>
          )}
          {viewing.landlord_note && (
            <div className="mt-2 text-sm text-navy-700 bg-navy-50 rounded-lg px-3 py-2 border border-navy-100">
              <span className="text-xs font-semibold text-muted">ตอบกลับจากเจ้าของ:</span> {viewing.landlord_note}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-3 text-ember-700 text-xs bg-ember-50 border border-ember-200 rounded px-3 py-2">{error}</div>
      )}

      {role === 'landlord' && viewing.status === 'requested' && (
        <div className="mt-4 flex gap-2">
          <button onClick={() => patch({ status: 'confirmed' })} disabled={busy} className="btn btn-primary btn-sm flex-1 disabled:opacity-60">
            <Check size={14} /> ยืนยันนัด
          </button>
          <button onClick={() => patch({ status: 'declined' })} disabled={busy} className="btn btn-outline btn-sm flex-1 disabled:opacity-60">
            <X size={14} /> ปฏิเสธ
          </button>
        </div>
      )}
      {role === 'tenant' && (viewing.status === 'requested' || viewing.status === 'confirmed') && (
        <div className="mt-4">
          <button onClick={() => patch({ status: 'cancelled' })} disabled={busy} className="btn btn-outline btn-sm w-full disabled:opacity-60">
            <X size={14} /> ยกเลิกการนัด
          </button>
        </div>
      )}
    </div>
  )
}