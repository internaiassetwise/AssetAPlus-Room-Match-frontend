// src/components/admin/InboxQueue.jsx — Admin message console over admin_queue.
//
// Everything the bot escalates lands in admin_queue. This is a LIVE takeover
// console: opening a ticket and hitting "รับเรื่อง" mutes the bot for that user
// and turns the ticket into a chat thread — the user's next messages stream in
// here (the bot stays silent), and each reply is pushed to their Line.
// "ปิดเรื่อง & ส่งกลับบอท" ends it and hands the user back to the AI.
//
// The queue spans BOTH tenants and landlords — reasons like create-room-draft /
// edit-description / upload-photos are landlord actions, faq-miss / view-a-room
// are typically tenants. Rendered as the "ข้อความ" tab inside AdminInbox.

import { useEffect, useMemo, useRef, useState } from 'react'
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

/** Where a conversation stands. Shared by the mobile cards and the desktop table. */
function StatusBadge({ it }) {
  if (it.isLive) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        แอดมินกำลังตอบ
      </span>
    )
  }
  if (it.needsAdmin) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs rounded-full border bg-amber-50 text-amber-700 border-amber-200">
        รอแอดมิน
        {it.reason && <span className="text-amber-600/70">· {REASON_LABEL[it.reason] || it.reason}</span>}
      </span>
    )
  }
  return (
    <span className="inline-block px-2 py-0.5 text-xs rounded-full border bg-navy-50 text-muted border-navy-200">
      บอทดูแลอยู่
    </span>
  )
}

// Bubble stamp inside a transcript. Same-day messages read better as just the
// clock; anything older still needs its date.
function fmtTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  const sameDay = d.toDateString() === new Date().toDateString()
  return d.toLocaleString('th-TH', sameDay
    ? { timeStyle: 'short' }
    : { dateStyle: 'short', timeStyle: 'short' })
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
      if (p.message) return p.message
      // A message-only payload with no captured text (older escalations) — show
      // nothing here rather than dumping {"message": null}; the summary covers it.
      { const keys = Object.keys(p); if (keys.length === 0 || (keys.length === 1 && keys[0] === 'message')) return '' }
      return JSON.stringify(p, null, 2)
  }
}

export default function InboxQueue() {
  // 'all' | 'needs_admin' | 'bot' — the inbox now lists EVERY conversation, not
  // just escalated tickets, because customers rarely know to press ติดต่อแอดมิน.
  const [status, setStatus] = useState('all')
  const [filter, setFilter] = useState('')
  const [claiming, setClaiming] = useState(false)
  const [selected, setSelected] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [sending, setSending] = useState(false)
  const [takingOver, setTakingOver] = useState(false)
  const [releasing, setReleasing] = useState(false)
  const [resolving, setResolving] = useState(false)
  const [sendError, setSendError] = useState('')

  const { data, loading, error, refetch, refresh } = useApi(
    () => api.listConversations({ filter: status, limit: 150 }),
    [status],
  )

  // The inbox is a screen people leave open and glance at, so it keeps itself
  // current. refresh() (not refetch) swaps the rows in silently — refetch would
  // flash "กำลังโหลด…" over the table every tick.
  useEffect(() => {
    const tick = () => { if (!document.hidden) refresh() }
    const id = setInterval(tick, 10_000)
    // A backgrounded tab stops polling; coming back should show the truth
    // immediately rather than after up to another ten seconds.
    const onVisible = () => { if (!document.hidden) refresh() }
    document.addEventListener('visibilitychange', onVisible)
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', onVisible) }
  }, [refresh])

  const items   = data?.items ?? []
  const summary = data?.summary ?? { total: 0, needsAdmin: 0, bot: 0 }

  const visible = useMemo(() => {
    const f = filter.trim().toLowerCase()
    if (!f) return items
    return items.filter((it) =>
      (it.userName   || '').toLowerCase().includes(f) ||
      (it.lineUserId || '').toLowerCase().includes(f) ||
      (it.lastText   || '').toLowerCase().includes(f) ||
      (it.summary    || '').toLowerCase().includes(f))
  }, [items, filter])

  // selected = { lineUserId, userName, transcript, ticket|null }
  // transcript = every message in/out, rebuilt from the LINE logs (see the
  // server's loadTranscript); ticket = the admin_queue row once one exists.
  const selectedUserRef = useRef(null)
  selectedUserRef.current = selected?.lineUserId ?? null

  // The transcript reads oldest-first, so opening a chat on the newest message
  // is what admin needs — the top is history they have usually already seen.
  const scrollRef = useRef(null)
  const msgCount = selected?.transcript?.length ?? 0

  // Which conversation we've already jumped to the bottom for. The panel opens
  // with an EMPTY transcript and fills it a moment later, so jumping on
  // lineUserId alone would scroll an empty box and leave the real content at
  // the top once it arrived.
  const jumpedForRef = useRef(null)

  useEffect(() => {
    const el = scrollRef.current
    const uid = selected?.lineUserId
    if (!el || !uid || msgCount === 0) return

    if (jumpedForRef.current !== uid) {
      // First paint of this conversation — land on the newest message with no
      // animation; smooth-scrolling through a long history is just a delay.
      jumpedForRef.current = uid
      el.scrollTop = el.scrollHeight
      return
    }
    // A message arrived while the panel was open. Follow it only if admin was
    // already at the bottom — yanking the view while they read back is worse
    // than a new message they can see arrive.
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120
    if (nearBottom) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [selected?.lineUserId, msgCount])

  async function openConversation(c) {
    setReplyText(''); setSendError('')
    setSelected({ lineUserId: c.lineUserId, userName: c.userName, transcript: [], ticket: null, rooms: [] })
    try {
      const d = await api.getConversation(c.lineUserId)
      setSelected({ lineUserId: c.lineUserId, userName: c.userName, transcript: d.transcript || [], ticket: d.ticket || null, rooms: d.rooms || [] })
    } catch { /* keep the shell open; the panel shows an empty transcript */ }
  }

  async function refreshSelected() {
    const uid = selectedUserRef.current
    if (!uid) return
    try {
      const d = await api.getConversation(uid)
      setSelected((s) => (s && s.lineUserId === uid
        ? { ...s, transcript: d.transcript || [], ticket: d.ticket || null, rooms: d.rooms || [] }
        : s))
    } catch { /* keep last */ }
  }

  // Poll the open conversation too. Fast during a live takeover (admin is
  // typing back and forth); slower otherwise, where it just needs to notice a
  // customer message arriving while the panel sits open.
  useEffect(() => {
    if (!selected?.lineUserId) return
    const every = selected?.ticket?.isLive ? 3000 : 10_000
    const t = setInterval(() => { if (!document.hidden) refreshSelected() }, every)
    return () => clearInterval(t)
  }, [selected?.lineUserId, selected?.ticket?.isLive])

  // Step in. A conversation that never escalated has no ticket yet, so claim
  // creates one first — that is what lets admin reach a customer who never
  // pressed ติดต่อแอดมิน.
  async function takeover() {
    if (!selected) return
    setTakingOver(true); setSendError('')
    try {
      const ticket = selected.ticket
        ? await api.takeoverAdminQueue(selected.ticket.id)
        : await api.claimConversation(selected.lineUserId)
      setSelected((s) => ({ ...s, ticket }))
      setReplyText('')
      await refetch()
    } catch (err) {
      setSendError(err instanceof ApiError ? err.message : 'รับเรื่องไม่สำเร็จ')
    } finally { setTakingOver(false) }
  }

  async function release() {
    if (!selected?.ticket) return
    setReleasing(true); setSendError('')
    try {
      const ticket = await api.releaseAdminQueue(selected.ticket.id)
      setSelected((s) => ({ ...s, ticket }))
      await refetch()
    } catch (err) {
      setSendError(err instanceof ApiError ? err.message : 'ปิดเรื่องไม่สำเร็จ')
    } finally { setReleasing(false) }
  }

  async function sendReply() {
    if (!selected?.ticket || !replyText.trim()) return
    setSending(true); setSendError('')
    try {
      const ticket = await api.replyAdminQueue(selected.ticket.id, { reply: replyText.trim() })
      setSelected((s) => ({ ...s, ticket }))
      setReplyText('')
      await refreshSelected()
    } catch (err) {
      setSendError(err instanceof ApiError ? err.message : 'ส่งคำตอบไม่สำเร็จ')
    } finally { setSending(false) }
  }

  async function resolve() {
    if (!selected?.ticket) return
    setResolving(true)
    try {
      await api.resolveAdminQueue(selected.ticket.id)
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

  const busy = sending || takingOver || releasing || resolving || claiming
  const isLive = !!selected?.ticket?.isLive

  return (
    <div>
      {/* Summary cards — also serve as the status filter. */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { key: 'all',         label: 'ทุกแชท',     value: summary.total      ?? 0 },
          { key: 'needs_admin', label: 'รอแอดมิน',   value: summary.needsAdmin ?? 0 },
          { key: 'bot',         label: 'บอทดูแลอยู่', value: summary.bot        ?? 0 },
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

      <div className="card px-3 py-2 flex items-center gap-2 w-full sm:max-w-md min-w-0 mb-4">
        <Search size={18} className="text-muted shrink-0" />
        <input
          value={filter} onChange={(e) => setFilter(e.target.value)}
          placeholder="ค้นหาจากชื่อ / Line ID / เนื้อหา"
          aria-label="ค้นหาแชท"
          className="bg-transparent outline-none text-base w-full min-w-0 py-1.5 placeholder:text-muted"
        />
      </div>

      {error && (
        <div className="card p-4 text-sm text-ember-700 flex flex-wrap items-center gap-3">
          <span>โหลดข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง</span>
          <button type="button" onClick={refetch} className="btn btn-outline btn-sm">ลองอีกครั้ง</button>
        </div>
      )}

      {/* Phones get cards. A four-column table on a 375px screen pushed the
          status and time columns off-screen entirely — the two things that tell
          an admin whether a chat needs them. */}
      <div className="sm:hidden space-y-2">
        {loading && <div className="card p-6 text-center text-muted text-sm">กำลังโหลด…</div>}
        {!loading && !error && visible.length === 0 && (
          <div className="card p-10 text-center text-muted">
            <Inbox size={32} className="mx-auto mb-2 text-navy-200" />
            <div className="text-sm">
              {status === 'needs_admin' && 'ไม่มีแชทที่รอแอดมิน'}
              {status === 'bot'         && 'ไม่มีแชทที่บอทดูแลอยู่'}
              {status === 'all'         && 'ยังไม่มีใครทักเข้ามา'}
            </div>
          </div>
        )}
        {visible.map((it) => (
          <button
            key={it.lineUserId}
            type="button"
            onClick={() => openConversation(it)}
            className={`card w-full text-left p-4 active:bg-cream-50 transition-colors ${it.isLive ? 'ring-1 ring-emerald-200 bg-emerald-50/40' : ''}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                {it.userName
                  ? <div className="text-[15px] font-semibold text-navy-700 truncate">{it.userName}</div>
                  : <div className="text-[15px] text-muted truncate">ไม่ทราบชื่อ</div>}
                <div className="mt-1 text-sm text-navy-700 line-clamp-2">{it.lastText || it.summary || '—'}</div>
              </div>
              <span className="text-[11px] text-muted shrink-0 tabular-nums">{fmtTime(it.lastAt)}</span>
            </div>
            <div className="mt-2.5"><StatusBadge it={it} /></div>
          </button>
        ))}
      </div>

      <div className="card overflow-hidden hidden sm:block">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-navy-50/60 border-b border-line text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-5 py-3.5 font-semibold">ผู้ใช้</th>
                <th className="px-5 py-3.5 font-semibold">ข้อความล่าสุด</th>
                <th className="px-5 py-3.5 font-semibold">สถานะ</th>
                <th className="px-5 py-3.5 font-semibold">เวลา</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {loading && (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-muted text-sm">กำลังโหลด…</td></tr>
              )}
              {!loading && !error && visible.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-muted">
                    <Inbox size={32} className="mx-auto mb-2 text-navy-200" />
                    <div className="text-sm">
                      {status === 'needs_admin' && 'ไม่มีแชทที่รอแอดมิน'}
                      {status === 'bot'         && 'ไม่มีแชทที่บอทดูแลอยู่'}
                      {status === 'all'         && 'ยังไม่มีใครทักเข้ามา'}
                    </div>
                  </td>
                </tr>
              )}
              {visible.map((it) => (
                <tr
                  key={it.lineUserId}
                  onClick={() => openConversation(it)}
                  className={`hover:bg-cream-50/40 cursor-pointer ${it.isLive ? 'bg-emerald-50/40' : ''}`}
                >
                  <td className="px-5 py-4 whitespace-nowrap">
                    {it.userName ? (
                      <span className="text-sm font-medium text-navy-700">{it.userName}</span>
                    ) : (
                      // No name resolves when the user has blocked/removed the bot —
                      // LINE answers 404 for their profile, so the id is all we have.
                      <>
                        <div className="text-sm text-muted">ไม่ทราบชื่อ</div>
                        <div className="text-[11px] font-mono text-navy-300">{`${(it.lineUserId || '').slice(0, 10)}…`}</div>
                      </>
                    )}
                  </td>
                  <td className="px-5 py-4 text-sm text-navy-700 max-w-md">
                    <span className="line-clamp-2">{it.lastText || it.summary || '—'}</span>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap"><StatusBadge it={it} /></td>
                  <td className="px-5 py-4 text-xs text-muted whitespace-nowrap">{fmtDate(it.lastAt)}</td>
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
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {isLive ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      แอดมินกำลังตอบ
                    </span>
                  ) : selected.ticket ? (
                    <span className={`inline-block px-2 py-0.5 text-xs rounded-full border ${REASON_BADGE[selected.ticket.reason] || ''}`}>
                      {REASON_LABEL[selected.ticket.reason] || selected.ticket.reason}
                    </span>
                  ) : (
                    <span className="inline-block px-2 py-0.5 text-xs rounded-full border bg-navy-50 text-muted border-navy-200">
                      บอทดูแลอยู่
                    </span>
                  )}
                </div>
                <h2 className="mt-2 font-bold text-navy-700 text-lg truncate">
                  {selected.userName || 'ไม่ทราบชื่อ'}
                </h2>
                <div className="font-mono text-[11px] text-muted break-all">{selected.lineUserId}</div>
              </div>
              <button onClick={() => { setSelected(null); setReplyText('') }} className="btn btn-ghost btn-sm shrink-0" aria-label="ปิด">
                <X size={18} />
              </button>
            </header>

            {/* Every room they asked about, with the FULL unit number — the cards
                in the transcript are masked for the customer, so this is the only
                place admin can tell two units of the same project apart.

                PINNED here, outside the scroll container, on purpose: it used to
                sit at the top of the transcript, which auto-scrolls to the bottom
                on open — so the one thing admin needed while reading was the one
                thing permanently scrolled out of view. Capped in height so a
                customer who browsed a dozen rooms can't push the chat off-screen. */}
            {selected.rooms?.length > 0 && (
              <div className="shrink-0 border-b border-line bg-navy-50/40 px-6 py-3 max-h-44 overflow-y-auto">
                <div className="text-xs uppercase text-muted mb-2">
                  ห้องที่ลูกค้าสอบถาม {selected.rooms.length > 1 && <span className="text-navy-700 font-semibold">({selected.rooms.length} ห้อง)</span>}
                </div>
                <ul className="space-y-1.5">
                  {selected.rooms.map((r) => (
                    <li key={r.roomId}>
                      <a
                        href={`/admin/rooms/${r.roomId}/edit`}
                        target="_blank" rel="noreferrer"
                        className="block rounded-lg border border-navy-200 bg-white px-3 py-2 hover:bg-navy-100 transition-colors"
                      >
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-sm font-semibold text-navy-700 truncate">{r.title}</span>
                          <span className="text-[11px] text-muted shrink-0">{fmtTime(r.askedAt)}</span>
                        </div>
                        <div className="text-xs text-muted">
                          {r.roomCode
                            ? <span className="font-mono font-semibold text-navy-700">ห้อง {r.roomCode}</span>
                            : <span>ยังไม่มีเลขห้อง</span>}
                          {' · '}฿{Number(r.monthlyRent || 0).toLocaleString()}/เดือน
                          {r.zone && ` · ย่าน${r.zone}`}
                          {r.status !== 'available' && ` · ${r.status}`}
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
              {selected.ticket?.summary && (
                <div>
                  <div className="text-xs uppercase text-muted mb-1">สรุปจากบอท</div>
                  <div className="text-sm text-navy-700">{selected.ticket.summary}</div>
                </div>
              )}

              {/* One merged thread — every message in and out, exactly as the
                  customer sees it in LINE. Bot replies, admin replies, stickers
                  and the takeover notices all come from the same source, so the
                  panel can no longer disagree with the customer's screen. */}
              <div>
                <div className="text-xs uppercase text-muted mb-2">บทสนทนาทั้งหมด</div>
                {selected.transcript.length === 0 ? (
                  <div className="text-sm text-muted">ยังไม่มีบทสนทนา</div>
                ) : (
                  <div className="space-y-2">
                    {selected.transcript.map((m, i) => (
                      <div key={i} className={`flex ${m.direction === 'out' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap ${
                          m.direction === 'out'
                            ? 'bg-navy-50 text-navy-700 rounded-br-sm border border-navy-100'
                            : 'bg-cream-50 text-navy-700 rounded-bl-sm border border-line'
                        }`}>
                          {m.text}
                          <div className="text-[10px] mt-1 text-muted">{fmtTime(m.ts)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {sendError && <div className="text-sm text-ember-700">{sendError}</div>}
            </div>

            {isLive ? (
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
                {selected.ticket && selected.ticket.status !== 'resolved' && (
                  <button onClick={resolve} disabled={busy} className="btn btn-ghost w-full">
                    <CheckCircle2 size={16} /> {resolving ? 'กำลังปิด…' : 'ปิดเรื่องโดยไม่รับ'}
                  </button>
                )}
              </footer>
            )}
          </aside>
        </>
      )}
    </div>
  )
}
