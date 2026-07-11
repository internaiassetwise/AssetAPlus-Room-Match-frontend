// src/components/admin/AdminInbox.jsx — Admin inbox over admin_queue.
//
// Everything the bot escalates lands in admin_queue. The inbox is now a LIVE
// takeover console: opening a ticket and hitting "รับเรื่อง" mutes the bot for
// that user and turns the ticket into a chat thread — the user's next messages
// stream in here (the bot stays silent), and each reply is pushed to their
// Line. "ปิดเรื่อง & ส่งกลับบอท" ends it and hands the user back to the AI.
//
// Layout: summary cards (open / replied / resolved / all — also the filter) on
// top, table below. Click a row → side panel with the detail + live chat thread.

import { useEffect, useMemo, useState } from 'react'
import { Search, Inbox, X, Send, CheckCircle2, MessageSquare } from '../icons.jsx'
import { useApi } from '../../hooks/useApi.js'
import { api, ApiError } from '../../api/client.js'

const REASON_LABEL = {
  'faq-miss':         'FAQ ไม่ตรง',
  'edit-description': 'ขอแก้รายละเอียดห้อง',
  'upload-photos':    'ส่งรูปห้อง',
  'view-a-room':      'ขอนัดชมห้อง',
  'create-room-draft':'ขอลงประกาศ',
  'system-error':     'ระบบขัดข้อง',
}
const REASON_BADGE = {
  'faq-miss':         'bg-navy-50 text-navy-700 border-navy-200',
  'edit-description': 'bg-amber-50 text-amber-700 border-amber-200',
  'upload-photos':    'bg-emerald-50 text-emerald-700 border-emerald-200',
  'view-a-room':      'bg-rose-50 text-rose-700 border-rose-200',
  'create-room-draft':'bg-violet-50 text-violet-700 border-violet-200',
  'system-error':     'bg-ember-50 text-ember-700 border-ember-200',
}
const STATUS_LABEL = { open: 'รอตอบ', replied: 'ตอบแล้ว', resolved: 'ปิดแล้ว' }
const STATUS_BADGE = {
  open:     'bg-amber-50 text-amber-700 border-amber-200',
  replied:  'bg-emerald-50 text-emerald-700 border-emerald-200',
  resolved: 'bg-navy-50 text-muted border-navy-200',
}

function fmtDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return isNaN(d.getTime()) ? iso : d.toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })
}

// Render the escalated payload as a readable block by reason.
function payloadText(reason, p) {
  if (!p || typeof p !== 'object') return ''
  switch (reason) {
    case 'edit-description':
      return `ห้อง #${p.roomId ?? '?'}\n${p.description || ''}`
    case 'upload-photos':
      return `ห้อง #${p.roomId ?? '—'}${p.messageId ? `\nรหัสรูป: ${p.messageId}` : ''}`
    case 'view-a-room':
      return `ห้อง #${p.roomId ?? '—'}${p.scheduledAt ? `\nวันที่อยากนัด: ${p.scheduledAt}` : ''}`
    default:
      return p.message || JSON.stringify(p, null, 2)
  }
}

export default function AdminInbox() {
  const [status, setStatus] = useState('open')
  const [filter, setFilter] = useState('')
  const [selected, setSelected] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [sending, setSending] = useState(false)
  const [takingOver, setTakingOver] = useState(false)
  const [releasing, setReleasing] = useState(false)
  const [resolving, setResolving] = useState(false)
  const [sendError, setSendError] = useState('')

  const apiStatus = status === 'all' ? undefined : status
  const { data, loading, error, refetch } = useApi(
    () => api.listAdminQueue({ status: apiStatus, limit: 100 }),
    [apiStatus],
  )

  const items   = data?.items ?? []
  const summary = data?.summary ?? { open: 0, replied: 0, resolved: 0 }
  const total   = (summary.open || 0) + (summary.replied || 0) + (summary.resolved || 0)

  const visible = useMemo(() => {
    const f = filter.trim().toLowerCase()
    if (!f) return items
    return items.filter((it) => {
      if ((it.lineUserId || '').toLowerCase().includes(f)) return true
      if ((it.summary || '').toLowerCase().includes(f)) return true
      const body = payloadText(it.reason, it.originalPayload).toLowerCase()
      return body.includes(f)
    })
  }, [items, filter])

  async function refreshSelected() {
    if (!selected) return
    try { setSelected(await api.getAdminQueue(selected.id)) } catch { /* keep last */ }
  }

  // While viewing a live ticket, poll for the user's incoming messages.
  useEffect(() => {
    if (!selected?.isLive) return
    const t = setInterval(refreshSelected, 5000)
    return () => clearInterval(t)
  }, [selected?.id, selected?.isLive])

  async function takeover() {
    if (!selected) return
    setTakingOver(true); setSendError('')
    try {
      setSelected(await api.takeoverAdminQueue(selected.id))
      setReplyText('')
      await refetch()
    } catch (err) {
      setSendError(err instanceof ApiError ? err.message : 'รับเรื่องไม่สำเร็จ')
    } finally { setTakingOver(false) }
  }

  async function release() {
    if (!selected) return
    setReleasing(true); setSendError('')
    try {
      setSelected(await api.releaseAdminQueue(selected.id))
      await refetch()
    } catch (err) {
      setSendError(err instanceof ApiError ? err.message : 'ปิดเรื่องไม่สำเร็จ')
    } finally { setReleasing(false) }
  }

  async function sendReply() {
    if (!selected || !replyText.trim()) return
    setSending(true); setSendError('')
    try {
      // Live ticket: reply appends to the thread + pushes to Line; keep the panel
      // open so the conversation continues.
      setSelected(await api.replyAdminQueue(selected.id, { reply: replyText.trim() }))
      setReplyText('')
    } catch (err) {
      setSendError(err instanceof ApiError ? err.message : 'ส่งคำตอบไม่สำเร็จ')
    } finally { setSending(false) }
  }

  async function resolve() {
    if (!selected) return
    setResolving(true)
    try {
      await api.resolveAdminQueue(selected.id)
      setSelected(null)
      await refetch()
    } catch (err) {
      setSendError(err instanceof ApiError ? err.message : 'ปิดรายการไม่สำเร็จ')
    } finally { setResolving(false) }
  }

  useEffect(() => {
    if (!selected) return
    const onKey = (e) => { if (e.key === 'Escape') { setSelected(null); setReplyText('') } }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selected])

  const thread = selected?.thread ?? []
  const busy = sending || takingOver || releasing || resolving

  return (
    <section>
      <div className="mb-7">
        <span className="eyebrow-navy">ข้อความจากแชทบอท</span>
        <h1 className="mt-3 font-bold text-navy-700 text-3xl sm:text-4xl tracking-tight">
          Inbox · คำถามที่บอทส่งต่อ
        </h1>
        <p className="mt-2 text-muted max-w-2xl">
          เมื่อบอทตอบไม่ได้ รายการจะมาที่นี่ กด <b>รับเรื่อง</b> เพื่อคุยกับลูกค้าเอง —
          บอทจะเงียบไประหว่างนั้น และข้อความของลูกค้าจะวิ่งเข้ามาที่นี่ทันที
        </p>
      </div>

      {/* Summary cards — also serve as the status filter. */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { key: 'open',     label: 'รอตอบ',   value: summary.open     ?? 0 },
          { key: 'replied',  label: 'ตอบแล้ว', value: summary.replied  ?? 0 },
          { key: 'resolved', label: 'ปิดแล้ว', value: summary.resolved ?? 0 },
          { key: 'all',      label: 'ทั้งหมด', value: total },
        ].map((s) => {
          const active = status === s.key
          return (
            <button
              key={s.key} type="button" onClick={() => setStatus(s.key)} aria-pressed={active}
              className={`card text-left p-4 transition border-2 ${active ? 'border-navy-700' : 'border-transparent hover:border-line'}`}
            >
              <div className="text-xs uppercase tracking-wider text-muted">{s.label}</div>
              <div className="mt-1 text-3xl font-bold text-navy-700">{s.value}</div>
            </button>
          )
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="card px-3 py-2 flex items-center gap-2 flex-1 max-w-md min-w-[260px]">
          <Search size={18} className="text-muted shrink-0" />
          <input
            value={filter} onChange={(e) => setFilter(e.target.value)}
            placeholder="ค้นหาจาก Line ID / เนื้อหา"
            className="bg-transparent outline-none text-sm w-full placeholder:text-muted"
          />
        </div>
      </div>

      {error && (
        <div className="card p-4 text-sm text-ember-700 flex flex-wrap items-center gap-3">
          <span>โหลดข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง</span>
          <button type="button" onClick={refetch} className="btn btn-outline btn-sm">ลองอีกครั้ง</button>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-navy-50/60 border-b border-line text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-5 py-3.5 font-semibold">ประเภท</th>
                <th className="px-5 py-3.5 font-semibold">Line ID</th>
                <th className="px-5 py-3.5 font-semibold">เนื้อหา</th>
                <th className="px-5 py-3.5 font-semibold">สถานะ</th>
                <th className="px-5 py-3.5 font-semibold">เวลา</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {loading && (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-muted text-sm">กำลังโหลด…</td></tr>
              )}
              {!loading && !error && visible.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-muted">
                    <Inbox size={32} className="mx-auto mb-2 text-navy-200" />
                    <div className="text-sm">
                      {status === 'open'     && 'ไม่มีคำถามรอตอบ'}
                      {status === 'replied'  && 'ยังไม่มีรายการที่ตอบแล้ว'}
                      {status === 'resolved' && 'ยังไม่มีรายการที่ปิดแล้ว'}
                      {status === 'all'      && 'ยังไม่มีรายการในกล่องข้อความ'}
                    </div>
                  </td>
                </tr>
              )}
              {visible.map((it) => (
                <tr
                  key={it.id}
                  onClick={() => { setSelected(it); setReplyText(''); setSendError('') }}
                  className={`hover:bg-cream-50/40 cursor-pointer ${it.isLive ? 'bg-emerald-50/40' : (it.status === 'open' ? '' : 'opacity-70')}`}
                >
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className={`inline-block px-2 py-0.5 text-xs rounded-full border ${REASON_BADGE[it.reason] || 'bg-navy-50 text-navy-700 border-navy-200'}`}>
                      {REASON_LABEL[it.reason] || it.reason}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs font-mono text-navy-700 whitespace-nowrap">
                    {(it.lineUserId || '').slice(0, 8)}…
                  </td>
                  <td className="px-5 py-4 text-sm text-navy-700 max-w-md">
                    <span className="line-clamp-2">{it.summary || payloadText(it.reason, it.originalPayload) || '—'}</span>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    {it.isLive ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        กำลังตอบอยู่
                      </span>
                    ) : (
                      <span className={`inline-block px-2 py-0.5 text-xs rounded-full border ${STATUS_BADGE[it.status] || ''}`}>
                        {STATUS_LABEL[it.status] || it.status}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-xs text-muted whitespace-nowrap">{fmtDate(it.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side panel for live chat / detail */}
      {selected && (
        <>
          <div className="fixed inset-0 bg-navy-900/30 z-40" onClick={() => { setSelected(null); setReplyText('') }} />
          <aside className="fixed top-0 right-0 bottom-0 w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col">
            <header className="px-6 py-4 border-b border-line flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`inline-block px-2 py-0.5 text-xs rounded-full border ${REASON_BADGE[selected.reason] || ''}`}>
                    {REASON_LABEL[selected.reason] || selected.reason}
                  </span>
                  {selected.isLive && (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      กำลังตอบอยู่
                    </span>
                  )}
                </div>
                <h2 className="mt-2 font-bold text-navy-700 text-lg">
                  {selected.isLive ? 'แชทสดกับลูกค้า' : (selected.status === 'open' ? 'รอแอดมินรับเรื่อง' : 'รายละเอียด')}
                </h2>
              </div>
              <button onClick={() => { setSelected(null); setReplyText('') }} className="btn btn-ghost btn-sm" aria-label="ปิด">
                <X size={18} />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs uppercase text-muted mb-1">Line user id</div>
                  <div className="font-mono text-xs text-navy-700 break-all">{selected.lineUserId}</div>
                </div>
                <div>
                  <div className="text-xs uppercase text-muted mb-1">ส่งเมื่อ</div>
                  <div className="text-sm text-navy-700">{fmtDate(selected.createdAt)}</div>
                </div>
              </div>
              {selected.summary && (
                <div>
                  <div className="text-xs uppercase text-muted mb-1">สรุปจากบอท</div>
                  <div className="text-sm text-navy-700">{selected.summary}</div>
                </div>
              )}
              <div>
                <div className="text-xs uppercase text-muted mb-1">รายละเอียดจากผู้ใช้</div>
                <div className="card p-4 bg-cream-50 text-sm text-navy-700 whitespace-pre-wrap">
                  {payloadText(selected.reason, selected.originalPayload) || '—'}
                </div>
              </div>

              {/* Live chat thread */}
              {thread.length > 0 && (
                <div>
                  <div className="text-xs uppercase text-muted mb-2">แชท</div>
                  <div className="space-y-2">
                    {thread.map((m, i) => (
                      <div key={i} className={`flex ${m.role === 'admin' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap ${
                          m.role === 'admin'
                            ? 'bg-navy-600 text-white rounded-br-sm'
                            : 'bg-cream-50 text-navy-700 rounded-bl-sm border border-line'
                        }`}>
                          {m.text}
                          <div className={`text-[10px] mt-1 ${m.role === 'admin' ? 'text-navy-100' : 'text-muted'}`}>{fmtDate(m.ts)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {sendError && <div className="text-sm text-ember-700">{sendError}</div>}
            </div>

            {selected.isLive ? (
              <footer className="px-6 py-4 border-t border-line bg-cream-50 space-y-3">
                <textarea
                  value={replyText} onChange={(e) => setReplyText(e.target.value)}
                  placeholder="พิมพ์ข้อความถึงลูกค้า… จะถูกส่งไปยัง Line ทันที (บอทเงียบอยู่)"
                  rows={3} className="input w-full resize-none" disabled={busy}
                  onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) sendReply() }}
                />
                <div className="flex flex-wrap gap-2 justify-end">
                  <button onClick={release} disabled={busy} className="btn btn-ghost">
                    <CheckCircle2 size={16} /> {releasing ? 'กำลังปิด…' : 'ปิดเรื่อง & ส่งกลับบอท'}
                  </button>
                  <button onClick={sendReply} disabled={busy || !replyText.trim()} className="btn btn-primary">
                    <Send size={16} /> {sending ? 'กำลังส่ง…' : 'ส่งข้อความ'}
                  </button>
                </div>
              </footer>
            ) : (
              <footer className="px-6 py-4 border-t border-line bg-cream-50 space-y-3">
                <button onClick={takeover} disabled={busy} className="btn btn-primary w-full">
                  <MessageSquare size={16} /> {takingOver ? 'กำลังรับเรื่อง…' : 'รับเรื่อง · แชทกับลูกค้า'}
                </button>
                {selected.status !== 'resolved' && (
                  <button onClick={resolve} disabled={busy} className="btn btn-ghost w-full">
                    <CheckCircle2 size={16} /> {resolving ? 'กำลังปิด…' : 'ปิดเรื่องโดยไม่รับ'}
                  </button>
                )}
              </footer>
            )}
          </aside>
        </>
      )}
    </section>
  )
}
