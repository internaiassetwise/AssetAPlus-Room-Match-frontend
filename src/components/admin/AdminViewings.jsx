// src/components/admin/AdminViewings.jsx — Admin management of tenant นัดชมห้อง.
//
// A tenant taps a bookable slot in Line → a viewing is created at 'requested'.
// Admin acts on it here:
//   • confirm  (requested → confirmed)  — tenant pushed a confirmation
//   • decline  (requested → declined)   — slot reopens; tenant told to repick
//   • cancel   (confirmed → cancelled)  — for a booking the tenant can no longer
//                                         make; slot reopens; tenant notified
// The status tabs let admin see every viewing, not just the pending ones.

import { useState } from 'react'
import { Check, X, Plus } from '../icons.jsx'
import { ConfirmDialog } from '../Modal.jsx'
import { useApi } from '../../hooks/useApi.js'
import { api, ApiError } from '../../api/client.js'

// datetime-local gives "YYYY-MM-DDTHH:MM" with no zone. The admin enters Bangkok
// (ICT) time, so stamp +07:00 explicitly — otherwise the server (UTC) would read
// it as UTC and the appointment would land 7h off.
function toICT(local) {
  if (!local) return ''
  const withSecs = local.length === 16 ? `${local}:00` : local
  return `${withSecs}+07:00`
}

const EMPTY_FORM = { tenantId: '', roomId: '', customDate: '', customTime: '', note: '' }

// Viewing hours: every day 08:00–18:00, on the hour. The last start is 17:00
// so a viewing that begins then still finishes inside the window.
const HOUR_CHIPS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00']

// Today (Bangkok) as YYYY-MM-DD, for the custom date input's min.
function todayICT() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' })
}
// True if the given YYYY-MM-DD is a Sunday (sales closed).
const TABS = [
  { value: 'requested', label: 'รอยืนยัน' },
  { value: 'confirmed', label: 'ยืนยันแล้ว' },
  { value: 'all',       label: 'ทั้งหมด' },
]

const STATUS_LABEL = {
  requested: 'รอยืนยัน',
  confirmed: 'ยืนยันแล้ว',
  declined:  'ปฏิเสธแล้ว',
  completed: 'เสร็จสิ้น',
  cancelled: 'ยกเลิกแล้ว',
}
const STATUS_BADGE = {
  requested: 'bg-amber-50 text-amber-700 border-amber-200',
  confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  declined:  'bg-rose-50 text-rose-700 border-rose-200',
  completed: 'bg-navy-50 text-navy-700 border-navy-200',
  cancelled: 'bg-navy-50 text-navy-500 border-navy-200',
}

function fmtDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return isNaN(d.getTime()) ? iso : d.toLocaleString('th-TH', { dateStyle: 'long', timeStyle: 'short' })
}

export default function AdminViewings() {
  const [status, setStatus] = useState('requested')
  const { data: viewings, loading, error, refetch } = useApi(
    () => api.listAdminViewings({ status }),
    [status],
  )
  const [actingId, setActingId] = useState(null)      // viewing id with an in-flight action
  const [pending, setPending]   = useState(null)      // { type:'decline'|'cancel', viewing } awaiting confirm
  const [actionError, setActionError] = useState('')

  // Admin-books-for-tenant form.
  const { data: tenants } = useApi(() => api.listTenants(), [])
  const { data: rooms }   = useApi(() => api.listRooms({ limit: 200 }), [])
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm]       = useState(EMPTY_FORM)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  const customReady = form.customDate && form.customTime
  const canCreate = !!(form.tenantId && form.roomId && customReady)

  function resetCreate() { setForm(EMPTY_FORM); setCreateError('') }

  async function createAppointment() {
    if (!canCreate) return
    setCreating(true); setCreateError('')
    try {
      const body = {
        tenantId:     Number(form.tenantId),
        roomId:       Number(form.roomId),
        note:         form.note.trim() || undefined,
        scheduledFor: toICT(`${form.customDate}T${form.customTime}`),
      }
      await api.createAdminViewing(body)
      resetCreate()
      setShowCreate(false)
      setStatus('confirmed')   // jump to where the new (confirmed) appointment shows
      await refetch()
    } catch (err) {
      setCreateError(err instanceof ApiError ? err.message : 'สร้างนัดชมไม่สำเร็จ')
    } finally {
      setCreating(false)
    }
  }

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

  async function runPending() {
    if (!pending) return
    const { type, viewing } = pending
    setActingId(viewing.id); setActionError('')
    try {
      if (type === 'cancel') await api.cancelAdminViewing(viewing.id)
      else                   await api.declineViewing(viewing.id)
      setPending(null)
      await refetch()
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'ดำเนินการไม่สำเร็จ')
    } finally {
      setActingId(null)
    }
  }

  const list = Array.isArray(viewings) ? viewings : []
  const emptyText = status === 'requested'
    ? 'ไม่มีคำขอนัดชมที่รอยืนยันในตอนนี้'
    : status === 'confirmed'
      ? 'ยังไม่มีนัดชมที่ยืนยันแล้ว'
      : 'ยังไม่มีรายการนัดชม'

  return (
    <section>
      <div className="mb-7">
        <span className="eyebrow-navy">นัดชมห้อง</span>
        <h1 className="mt-3 font-bold text-navy-700 text-3xl sm:text-4xl tracking-tight">
          นัดชมห้อง {list.length > 0 && <span className="text-muted text-2xl">({list.length})</span>}
        </h1>
        <p className="mt-2 text-muted max-w-2xl">
          ผู้เช่าจองเวลานัดชมผ่านแชทบอท แอดมินเป็นคนยืนยัน/ปฏิเสธ และยกเลิกได้หากผู้เช่านัดไม่ได้แล้ว
          — ทุกการเปลี่ยนสถานะ บอทจะแจ้งผู้เช่าทาง Line ให้อัตโนมัติ
        </p>
      </div>

      {/* Admin books an appointment for a tenant (on request) */}
      <div className="mb-6">
        {!showCreate ? (
          <button type="button" onClick={() => { setShowCreate(true); setCreateError('') }} className="btn btn-outline btn-sm">
            <Plus size={16} /> สร้างนัดชมให้ผู้เช่า
          </button>
        ) : (
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-navy-700 text-base">สร้างนัดชมให้ผู้เช่า</h2>
              <button type="button" onClick={() => { setShowCreate(false); resetCreate() }} className="btn btn-ghost btn-sm" aria-label="ปิด">
                <X size={16} />
              </button>
            </div>
            <p className="text-xs text-muted mb-4">
              ใช้เมื่อผู้เช่าขอให้แอดมินนัดให้ — ระบบจะสร้างเป็น “ยืนยันแล้ว” และแจ้งผู้เช่าทาง Line ทันที
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">ผู้เช่า</label>
                <select className="input" value={form.tenantId} onChange={(e) => setForm({ ...form, tenantId: e.target.value })}>
                  <option value="">— เลือกผู้เช่า —</option>
                  {(tenants || []).map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.full_name || `ผู้เช่า #${t.id}`}{t.phone ? ` · ${t.phone}` : ''}{t.line_id ? '' : ' · (ไม่มี Line)'}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">ห้อง</label>
                <select
                  className="input"
                  value={form.roomId}
                  onChange={(e) => { setForm({ ...EMPTY_FORM, tenantId: form.tenantId, roomId: e.target.value, note: form.note }); setUseCustom(false) }}
                >
                  <option value="">— เลือกห้อง —</option>
                  {(rooms || []).map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title} · ฿{Number(r.price || r.monthlyRent || 0).toLocaleString('en-US')}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Admin sets the time directly. The self-service slot flow is
                gone, so there is nothing to pick from — the room only had to be
                chosen first because the slot list depended on it. */}
            <div className="mt-4 grid sm:grid-cols-2 gap-3">
              <div>
                <label className="label">วันที่</label>
                <input
                  type="date"
                  className="input"
                  min={todayICT()}
                  value={form.customDate}
                  onChange={(e) => setForm({ ...form, customDate: e.target.value })}
                />
              </div>
              <div>
                <label className="label">เวลา <span className="font-normal text-muted">(ทุกวัน 08:00–18:00)</span></label>
                <div className="flex flex-wrap gap-2">
                  {HOUR_CHIPS.map((h) => {
                    const active = form.customTime === h
                    return (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setForm({ ...form, customTime: h })}
                        className={`min-h-11 px-3 rounded-lg text-sm font-medium border transition-colors ${
                          active ? 'bg-navy-700 text-white border-navy-700' : 'bg-white text-navy-700 border-line hover:bg-navy-50'
                        }`}
                      >
                        {h}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="mt-4">
              <label className="label">หมายเหตุ (ไม่บังคับ)</label>
              <input className="input" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="เช่น ลูกค้าขอนัดช่วงเย็น" />
            </div>

            {createError && <div className="mt-3 text-ember-700 text-sm">{createError}</div>}
            <button
              type="button"
              onClick={createAppointment}
              disabled={creating || !canCreate}
              className="btn btn-primary mt-4 disabled:opacity-50"
            >
              <Check size={16} /> {creating ? 'กำลังสร้าง…' : 'สร้างนัดชม (ยืนยันเลย)'}
            </button>
          </div>
        )}
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {TABS.map((t) => {
          const active = status === t.value
          return (
            <button
              key={t.value}
              type="button"
              onClick={() => setStatus(t.value)}
              aria-pressed={active}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                active ? 'bg-navy-700 text-white border-navy-700' : 'bg-white text-navy-700 border-line hover:bg-navy-50'
              }`}
            >
              {t.label}
            </button>
          )
        })}
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
          <div className="text-sm">{emptyText}</div>
        </div>
      )}

      <div className="space-y-4">
        {list.map((v) => (
          <div key={v.id} className="card overflow-hidden">
            <div className="flex flex-col sm:flex-row gap-4 p-5">
              <div className="sm:w-40 h-32 sm:h-auto rounded-lg overflow-hidden bg-cream-100 shrink-0">
                {v.room?.image
                  ? <img src={v.room.image} alt={v.room.title} className="w-full h-full object-cover" />
                  : <div className="w-full h-full grid place-items-center text-muted text-xs">ไม่มีรูป</div>}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-bold text-navy-700 text-lg">{v.room?.title || 'ห้องเช่า'}</h2>
                    <span className={`text-[11px] font-semibold border rounded-full px-2 py-0.5 ${STATUS_BADGE[v.status] || ''}`}>
                      {STATUS_LABEL[v.status] || v.status}
                    </span>
                  </div>
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

              {/* Actions — depend on status */}
              <div className="flex sm:flex-col gap-2 sm:justify-start shrink-0">
                {v.status === 'requested' && (
                  <>
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
                      onClick={() => setPending({ type: 'decline', viewing: v })}
                      disabled={actingId === v.id}
                      className="btn btn-ghost btn-sm text-ember-700 flex-1 sm:flex-none"
                    >
                      <X size={16} /> ปฏิเสธ
                    </button>
                  </>
                )}
                {v.status === 'confirmed' && (
                  <button
                    type="button"
                    onClick={() => setPending({ type: 'cancel', viewing: v })}
                    disabled={actingId === v.id}
                    className="btn btn-outline btn-sm text-ember-700 flex-1 sm:flex-none"
                  >
                    <X size={16} /> ยกเลิกนัด
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={!!pending}
        title={pending?.type === 'cancel' ? 'ยกเลิกนัดชมนี้?' : 'ปฏิเสธคำขอนัดชมนี้?'}
        message={pending
          ? pending.type === 'cancel'
            ? `ยกเลิกนัดชม "${pending.viewing.room?.title}" (${fmtDate(pending.viewing.scheduledFor)})? เวลานี้จะเปิดให้จองใหม่ และบอทจะแจ้งผู้เช่าว่านัดถูกยกเลิก`
            : `ปฏิเสธนัดชม "${pending.viewing.room?.title}" (${fmtDate(pending.viewing.scheduledFor)})? เวลานี้จะเปิดให้จองใหม่ และบอทจะบอกผู้เช่าให้เลือกเวลาอื่น`
          : ''}
        confirmLabel={actingId === pending?.viewing?.id ? 'กำลังดำเนินการ…' : (pending?.type === 'cancel' ? 'ยกเลิกนัด' : 'ปฏิเสธ')}
        confirmTone="danger"
        busy={actingId === pending?.viewing?.id}
        onCancel={() => !actingId && setPending(null)}
        onConfirm={runPending}
      />
    </section>
  )
}
