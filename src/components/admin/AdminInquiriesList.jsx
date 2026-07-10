// src/components/admin/AdminInquiriesList.jsx — Admin inbox of Line bot inquiries.
//
// Every question the bot can't answer via FAQ, every edit-description
// request, every photo upload, and every view-a-room request lands here.
// Admin opens one, types a reply, hits "ส่งคำตอบ" — Express calls the bot's
// /api/admin/push which pushes the message to the tenant's Line.
//
// Layout: filter chips (open / replied / resolved / all) on top, table
// below. Click a row → side panel slides in with the full payload + reply
// form. Closing the panel goes back to the list.

import { useEffect, useMemo, useState } from 'react'
import { Search, Inbox, X, Send, CheckCircle2 } from '../icons.jsx'
import { useApi } from '../../hooks/useApi.js'
import { api, ApiError } from '../../api/client.js'

const TYPE_LABEL = {
  'ask-about-room':  'ถามเกี่ยวกับห้อง',
  'edit-description':'ขอแก้รายละเอียดห้อง',
  'upload-photos':   'ส่งรูปห้อง',
  'view-a-room':     'ขอนัดชมห้อง',
}
const TYPE_BADGE = {
  'ask-about-room':  'bg-navy-50 text-navy-700 border-navy-200',
  'edit-description':'bg-amber-50 text-amber-700 border-amber-200',
  'upload-photos':   'bg-emerald-50 text-emerald-700 border-emerald-200',
  'view-a-room':     'bg-rose-50 text-rose-700 border-rose-200',
}
const STATUS_LABEL = {
  open:     'รอตอบ',
  replied:  'ตอบแล้ว',
  resolved: 'ปิดแล้ว',
}
const STATUS_BADGE = {
  open:     'bg-amber-50 text-amber-700 border-amber-200',
  replied:  'bg-emerald-50 text-emerald-700 border-emerald-200',
  resolved: 'bg-navy-50 text-muted border-navy-200',
}

function fmtDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })
}

function PayloadPreview({ type, payload }) {
  // Render a compact one-line summary so the table isn't too wide.
  if (!payload || typeof payload !== 'object') return <span className="text-muted">—</span>
  switch (type) {
    case 'ask-about-room':
      return <span className="line-clamp-2">{payload.text || '—'}</span>
    case 'edit-description':
      return (
        <span className="line-clamp-2">
          ห้อง #{payload.roomId ?? '?'}
          {payload.roomTitle ? ` "${payload.roomTitle}"` : ''} — {payload.description || ''}
        </span>
      )
    case 'upload-photos':
      return <span>ห้อง #{payload.roomId ?? '?'} · {payload.messageId || ''}</span>
    case 'view-a-room':
      return <span>ห้อง #{payload.roomId ?? '?'} · {payload.scheduledAt || ''}</span>
    default:
      return <code className="text-xs">{JSON.stringify(payload)}</code>
  }
}

export default function AdminInquiriesList() {
  // 'all' is shown as a 4th card; everything else maps 1:1 to a status.
  const [status, setStatus] = useState('open')
  const [filter, setFilter] = useState('')
  const [selected, setSelected] = useState(null)        // row being replied to
  const [replyText, setReplyText] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState('')
  const [resolving, setResolving] = useState(false)

  const apiStatus = status === 'all' ? undefined : status
  const { data, loading, error, refetch } = useApi(
    () => api.listBotInquiries({ status: apiStatus, limit: 100 }),
    [apiStatus],
  )

  const items   = data?.items ?? []
  const summary = data?.summary ?? { open: 0, replied: 0, resolved: 0 }
  const total   = (summary.open || 0) + (summary.replied || 0) + (summary.resolved || 0)

  // Filter by text — lineUserId / payload text
  const visible = useMemo(() => {
    const f = filter.trim().toLowerCase()
    if (!f) return items
    return items.filter((it) => {
      if ((it.lineUserId || '').toLowerCase().includes(f)) return true
      const p = it.payload || {}
      const haystack = `${p.text || ''} ${p.description || ''} ${p.roomTitle || ''}`.toLowerCase()
      return haystack.includes(f)
    })
  }, [items, filter])

  async function sendReply() {
    if (!selected || !replyText.trim()) return
    setSending(true)
    setSendError('')
    try {
      await api.replyBotInquiry(selected.id, { reply: replyText.trim() })
      setSelected(null)
      setReplyText('')
      await refetch()
    } catch (err) {
      setSendError(err instanceof ApiError ? err.message : 'ส่งคำตอบไม่สำเร็จ')
    } finally {
      setSending(false)
    }
  }

  async function resolve() {
    if (!selected) return
    setResolving(true)
    try {
      await api.resolveBotInquiry(selected.id)
      setSelected(null)
      await refetch()
    } catch (err) {
      setSendError(err instanceof ApiError ? err.message : 'ปิดรายการไม่สำเร็จ')
    } finally {
      setResolving(false)
    }
  }

  // Close the panel on Escape
  useEffect(() => {
    if (!selected) return
    const onKey = (e) => { if (e.key === 'Escape') { setSelected(null); setReplyText('') } }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selected])

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-7">
        <div>
          <span className="eyebrow-navy">ข้อความจากแชทบอท</span>
          <h1 className="mt-3 font-bold text-navy-700 text-3xl sm:text-4xl tracking-tight">
            Inbox · คำถามที่บอทส่งต่อ
          </h1>
          <p className="mt-2 text-muted max-w-2xl">
            เมื่อบอทไม่สามารถตอบคำถามจาก FAQ ได้ หรือผู้ใช้ขอแก้รายละเอียดห้อง / ส่งรูป / นัดชมห้อง
            รายการจะมาอยู่ที่นี่ ตอบกลับแล้วบอทจะส่งข้อความไปยัง Line ของผู้ใช้ให้อัตโนมัติ
          </p>
        </div>
      </div>

      {/* Summary cards — also serve as the status filter (no separate chip row). */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { key: 'open',     label: 'รอตอบ',   value: summary.open     ?? 0 },
          { key: 'replied',  label: 'ตอบแล้ว', value: summary.replied  ?? 0 },
          { key: 'resolved', label: 'ปิดแล้ว',  value: summary.resolved ?? 0 },
          { key: 'all',      label: 'ทั้งหมด',  value: total },
        ].map((s) => {
          const active = status === s.key
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => setStatus(s.key)}
              aria-pressed={active}
              className={`card text-left p-4 transition border-2 ${
                active ? 'border-navy-700' : 'border-transparent hover:border-line'
              }`}
            >
              <div className="text-xs uppercase tracking-wider text-muted">{s.label}</div>
              <div className="mt-1 text-3xl font-bold text-navy-700">{s.value}</div>
            </button>
          )
        })}
      </div>

      {/* Search */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="card px-3 py-2 flex items-center gap-2 flex-1 max-w-md min-w-[260px]">
          <Search size={18} className="text-muted shrink-0" />
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="ค้นหาจาก Line ID / เนื้อหา"
            className="bg-transparent outline-none text-sm w-full placeholder:text-muted"
          />
        </div>
      </div>

      {error && (
        <div className="card p-4 text-sm text-ember-700 flex flex-wrap items-center gap-3">
          <span>โหลดข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง</span>
          <button type="button" onClick={refetch} className="btn btn-outline btn-sm">
            ลองอีกครั้ง
          </button>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-navy-50/60 border-b border-line text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-5 py-3.5 font-semibold">ประเภท</th>
                <th className="px-5 py-3.5 font-semibold">Line ID</th>
                <th className="px-5 py-3.5 font-semibold">ข้อความ</th>
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
                  className={`hover:bg-cream-50/40 cursor-pointer ${status === 'open' ? '' : 'opacity-70'}`}
                >
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className={`inline-block px-2 py-0.5 text-xs rounded-full border ${TYPE_BADGE[it.inquiryType] || 'bg-navy-50 text-navy-700 border-navy-200'}`}>
                      {TYPE_LABEL[it.inquiryType] || it.inquiryType}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs font-mono text-navy-700 whitespace-nowrap">
                    {it.lineUserId.slice(0, 8)}…
                  </td>
                  <td className="px-5 py-4 text-sm text-navy-700 max-w-md">
                    <PayloadPreview type={it.inquiryType} payload={it.payload} />
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className={`inline-block px-2 py-0.5 text-xs rounded-full border ${STATUS_BADGE[it.status] || ''}`}>
                      {STATUS_LABEL[it.status] || it.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs text-muted whitespace-nowrap">
                    {fmtDate(it.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side panel for reply */}
      {selected && (
        <>
          <div
            className="fixed inset-0 bg-navy-900/30 z-40"
            onClick={() => { setSelected(null); setReplyText('') }}
          />
          <aside className="fixed top-0 right-0 bottom-0 w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col">
            <header className="px-6 py-4 border-b border-line flex items-center justify-between">
              <div>
                <span className={`inline-block px-2 py-0.5 text-xs rounded-full border ${TYPE_BADGE[selected.inquiryType] || ''}`}>
                  {TYPE_LABEL[selected.inquiryType] || selected.inquiryType}
                </span>
                <h2 className="mt-2 font-bold text-navy-700 text-lg">
                  {selected.status === 'open' ? 'ตอบกลับผู้ใช้' : 'รายละเอียด'}
                </h2>
              </div>
              <button
                onClick={() => { setSelected(null); setReplyText('') }}
                className="btn btn-ghost btn-sm"
                aria-label="ปิด"
              >
                <X size={18} />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <div className="text-xs uppercase text-muted mb-1">Line user id</div>
                <div className="font-mono text-sm text-navy-700">{selected.lineUserId}</div>
              </div>
              <div>
                <div className="text-xs uppercase text-muted mb-1">ส่งเมื่อ</div>
                <div className="text-sm text-navy-700">{fmtDate(selected.createdAt)}</div>
              </div>
              <div>
                <div className="text-xs uppercase text-muted mb-1">ข้อความจากผู้ใช้</div>
                <div className="card p-4 bg-cream-50 text-sm text-navy-700 whitespace-pre-wrap">
                  {selected.inquiryType === 'edit-description'
                    ? `ห้อง #${selected.payload?.roomId ?? '?'}\n${selected.payload?.roomTitle ? `"${selected.payload.roomTitle}"\n` : ''}\n${selected.payload?.description ?? ''}`
                    : selected.inquiryType === 'view-a-room'
                    ? `ห้อง #${selected.payload?.roomId ?? '?'}\nวันที่ต้องการนัด: ${selected.payload?.scheduledAt ?? 'ไม่ระบุ'}`
                    : selected.inquiryType === 'upload-photos'
                    ? `ห้อง #${selected.payload?.roomId ?? '?'}\nรูปภาพ: ${selected.payload?.url ?? '(อัปโหลดแล้ว)'}`
                    : selected.payload?.text ?? JSON.stringify(selected.payload, null, 2)}
                </div>
              </div>
              {selected.adminReply && (
                <div>
                  <div className="text-xs uppercase text-muted mb-1">คำตอบของคุณ</div>
                  <div className="card p-4 text-sm text-navy-700 whitespace-pre-wrap">
                    {selected.adminReply}
                  </div>
                  <div className="text-xs text-muted mt-1">ตอบเมื่อ {fmtDate(selected.repliedAt)}</div>
                </div>
              )}
              {sendError && (
                <div className="text-sm text-ember-700">{sendError}</div>
              )}
            </div>

            {selected.status === 'open' && (
              <footer className="px-6 py-4 border-t border-line bg-cream-50 space-y-3">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="พิมพ์คำตอบ… จะถูกส่งไปยัง Line ของผู้ใช้ทันที"
                  rows={4}
                  className="input w-full resize-none"
                  disabled={sending || resolving}
                />
                <div className="flex flex-wrap gap-2 justify-end">
                  <button
                    onClick={resolve}
                    disabled={sending || resolving}
                    className="btn btn-ghost"
                  >
                    <CheckCircle2 size={16} />
                    {resolving ? 'กำลังปิด…' : 'ปิดโดยไม่ตอบ'}
                  </button>
                  <button
                    onClick={sendReply}
                    disabled={sending || resolving || !replyText.trim()}
                    className="btn btn-primary"
                  >
                    <Send size={16} />
                    {sending ? 'กำลังส่ง…' : 'ส่งคำตอบ'}
                  </button>
                </div>
              </footer>
            )}
          </aside>
        </>
      )}
    </section>
  )
}