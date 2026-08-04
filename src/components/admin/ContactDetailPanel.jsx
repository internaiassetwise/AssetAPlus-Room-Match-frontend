// src/components/admin/ContactDetailPanel.jsx — everything we know about one person.
//
// The directory answered "who exists" but not "what is going on with them", so
// checking an owner's rooms meant going to the room list and scanning by name.
// Opening a row here shows their rooms (landlord) or their viewings, matches
// and the room they last asked about (tenant), each linking onward.

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, ApiError } from '../../api/client.js'
import { X, Home, Phone, LineChat } from '../icons.jsx'

const baht = (n) => `฿${Number(n || 0).toLocaleString()}`

const ROOM_STATUS = {
  available: ['ว่าง',     'bg-emerald-50 text-emerald-700 border-emerald-200'],
  reserved:  ['จองแล้ว',  'bg-ember-50 text-ember-700 border-ember-200'],
  matched:   ['มีผู้เช่า', 'bg-navy-50 text-navy-700 border-navy-200'],
  inactive:  ['ปิด',      'bg-navy-50 text-muted border-navy-200'],
  pending:   ['รออนุมัติ', 'bg-amber-50 text-amber-700 border-amber-200'],
}

const VIEWING_STATUS = {
  requested: 'ขอนัด',
  confirmed: 'ยืนยันแล้ว',
  cancelled: 'ยกเลิก',
  completed: 'ดูแล้ว',
}

function fmtDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return isNaN(d.getTime()) ? '—' : d.toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })
}

function Section({ title, count, children }) {
  return (
    <section>
      <h3 className="text-xs uppercase tracking-wider text-muted mb-2">
        {title} {count != null && <span className="text-navy-700 font-semibold">({count})</span>}
      </h3>
      {children}
    </section>
  )
}

function Empty({ children }) {
  return <div className="text-sm text-muted py-2">{children}</div>
}

export default function ContactDetailPanel({ role, id, name, onClose }) {
  const [data, setData]       = useState(null)
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    setLoading(true); setError(''); setData(null)
    const load = role === 'landlord' ? api.getLandlordDetail(id) : api.getTenantDetail(id)
    load
      .then((d) => { if (alive) setData(d) })
      .catch((err) => { if (alive) setError(err instanceof ApiError ? err.message : 'โหลดข้อมูลไม่สำเร็จ') })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [role, id])

  // Escape closes — matches the inbox panel, and on a phone it is the only
  // affordance besides the X.
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const person = data?.landlord ?? data?.tenant
  const phone  = person?.phone
  const lineId = person?.lineId ?? person?.line_id

  return (
    <>
      <div className="fixed inset-0 bg-navy-900/30 z-40" onClick={onClose} />
      <aside className="fixed top-0 right-0 bottom-0 w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col">
        <header className="px-5 sm:px-6 py-4 border-b border-line flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-wider text-muted">
              {role === 'landlord' ? 'เจ้าของห้อง' : 'ผู้เช่า'}
            </div>
            <h2 className="font-bold text-navy-700 text-lg truncate">{person?.fullName || person?.full_name || name}</h2>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted">
              {phone && <a href={`tel:${phone}`} className="inline-flex items-center gap-1 hover:text-navy-700"><Phone size={13} /> {phone}</a>}
              {lineId && <span className="inline-flex items-center gap-1 text-[#06C755]"><LineChat size={13} /> เชื่อม Line แล้ว</span>}
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm shrink-0" aria-label="ปิด"><X size={18} /></button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-6">
          {loading && <div className="text-center text-muted text-sm py-8">กำลังโหลด…</div>}
          {error && <div className="text-sm text-ember-700">{error}</div>}

          {data && role === 'landlord' && (
            <>
              <Section title="ห้องของเจ้าของรายนี้" count={data.rooms.length}>
                {data.rooms.length === 0 ? <Empty>ยังไม่มีห้องในระบบ</Empty> : (
                  <ul className="space-y-2">
                    {data.rooms.map((r) => {
                      const [label, tone] = ROOM_STATUS[r.status] ?? [r.status, 'bg-navy-50 text-muted border-navy-200']
                      return (
                        <li key={r.id}>
                          <Link to={`/admin/rooms/${r.id}/edit`}
                            className="card p-3 flex items-start justify-between gap-3 hover:border-navy-300 transition-colors">
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-navy-700 truncate">{r.title}</div>
                              <div className="text-xs text-muted mt-0.5">
                                {r.roomCode && `ห้อง ${r.roomCode} · `}{r.zone} · {baht(r.price)}/เดือน
                              </div>
                            </div>
                            <span className={`shrink-0 px-2 py-0.5 text-[11px] rounded-full border ${tone}`}>{label}</span>
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </Section>

              <Section title="นัดชมห้องของเขา" count={data.viewings.length}>
                {data.viewings.length === 0 ? <Empty>ยังไม่มีนัดชม</Empty> : (
                  <ul className="space-y-1.5">
                    {data.viewings.map((v) => (
                      <li key={v.id} className="text-sm flex items-center justify-between gap-3 border-b border-line pb-1.5">
                        <span className="text-navy-700 truncate">{v.roomTitle || `ห้อง #${v.roomId}`}</span>
                        <span className="text-xs text-muted shrink-0">
                          {fmtDate(v.scheduledFor)} · {VIEWING_STATUS[v.status] || v.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </Section>
            </>
          )}

          {data && role === 'tenant' && (
            <>
              {data.interest && (
                <Section title="ห้องที่ถามล่าสุด">
                  <Link to={`/admin/rooms/${data.interest.roomId}/edit`}
                    className="card p-3 block hover:border-navy-300 transition-colors">
                    <div className="text-sm font-semibold text-navy-700">{data.interest.title}</div>
                    <div className="text-xs text-muted mt-0.5">
                      {data.interest.roomCode && `ห้อง ${data.interest.roomCode} · `}
                      {baht(data.interest.monthlyRent)}/เดือน · ถามเมื่อ {fmtDate(data.interest.askedAt)}
                    </div>
                  </Link>
                </Section>
              )}

              <Section title="นัดชมห้อง" count={data.viewings.length}>
                {data.viewings.length === 0 ? <Empty>ยังไม่เคยนัดชม</Empty> : (
                  <ul className="space-y-1.5">
                    {data.viewings.map((v) => (
                      <li key={v.id} className="text-sm flex items-center justify-between gap-3 border-b border-line pb-1.5">
                        <span className="text-navy-700 truncate">{v.roomTitle || `ห้อง #${v.roomId}`}</span>
                        <span className="text-xs text-muted shrink-0">
                          {fmtDate(v.scheduledFor)} · {VIEWING_STATUS[v.status] || v.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </Section>

              <Section title="ห้องที่จับคู่ไว้" count={data.matches.length}>
                {data.matches.length === 0 ? <Empty>ยังไม่ได้จับคู่ห้องให้</Empty> : (
                  <ul className="space-y-1.5">
                    {data.matches.map((m) => (
                      <li key={m.id} className="text-sm flex items-center justify-between gap-3 border-b border-line pb-1.5">
                        <Link to={`/admin/rooms/${m.roomId}/edit`} className="text-navy-700 truncate hover:underline">
                          {m.roomTitle || `ห้อง #${m.roomId}`}
                        </Link>
                        <span className="text-xs text-muted shrink-0">{m.status}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Section>

              <Link to="/admin/inbox" className="btn btn-outline w-full">
                <Home size={16} /> ดูแชทของลูกค้ารายนี้ใน Inbox
              </Link>
            </>
          )}
        </div>
      </aside>
    </>
  )
}
