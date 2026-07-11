// src/pages/Inquiries.jsx — Landlord inbox for tenant messages.
//
// Shows list of inquiries grouped by status (new / replied / closed). Click a
// card to expand and reply.

import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { useApi } from '../hooks/useApi.js'
import { api, ApiError } from '../api/client.js'
import { Inbox, MessageSquare, ArrowRight, X, Check } from '../components/icons.jsx'

const STATUS_LABEL = { new: 'ใหม่', replied: 'ตอบแล้ว', closed: 'ปิดแล้ว' }
const STATUS_STYLES = {
  new:     'bg-amber-50 text-amber-700 border-amber-200',
  replied: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  closed:  'bg-navy-50 text-navy-500 border-navy-200',
}

export default function Inquiries() {
  const { data: list, loading, error, reload } = useApi(
    () => api.listInquiries({ role: 'landlord' }),
    []
  )

  const items = list || []
  const [filter, setFilter] = useState('all')
  const filtered = filter === 'all' ? items : items.filter((i) => i.status === filter)

  const counts = items.reduce((acc, i) => (acc[i.status] = (acc[i.status] || 0) + 1, acc), {})
  const newCount = counts.new || 0

  return (
    <>
      <Navbar />
      <main className="container-page py-10 max-w-4xl">
        <header className="mb-7">
          <span className="eyebrow-navy"><Inbox size={14} /> กล่องข้อความ</span>
          <h1 className="mt-3 text-3xl font-bold text-navy-700">
            ข้อความจาก<span className="text-ember-600"> ผู้สนใจ</span>
          </h1>
          <p className="mt-2 text-muted">ผู้สนใจเช่าห้องทักเข้ามา — ตอบกลับด้วยข้อความสั้นๆ ได้เลย</p>
        </header>

        <div className="card p-4 mb-6 flex items-center gap-2 overflow-x-auto">
          <FilterPill current={filter} value="all"     onClick={setFilter}>ทั้งหมด ({items.length})</FilterPill>
          <FilterPill current={filter} value="new"     onClick={setFilter}>ใหม่ ({newCount})</FilterPill>
          <FilterPill current={filter} value="replied" onClick={setFilter}>ตอบแล้ว ({counts.replied || 0})</FilterPill>
          <FilterPill current={filter} value="closed"  onClick={setFilter}>ปิดแล้ว ({counts.closed || 0})</FilterPill>
        </div>

        {loading && <div className="text-muted text-center py-10">กำลังโหลด…</div>}
        {error && <div className="card p-6 text-ember-700">{error.message}</div>}
        {filtered.length === 0 && !loading && (
          <div className="card p-10 text-center text-muted">
            <MessageSquare size={32} className="mx-auto text-navy-300" />
            <p className="mt-3">ยังไม่มีข้อความ</p>
          </div>
        )}
        {filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map((i) => (
              <InquiryCard key={i.id} inquiry={i} onChanged={reload} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}

function FilterPill({ current, value, onClick, children }) {
  const active = current === value
  return (
    <button type="button" onClick={() => onClick(value)}
            className={`chip whitespace-nowrap ${active ? 'chip-active' : ''}`}>
      {children}
    </button>
  )
}

function InquiryCard({ inquiry, onChanged }) {
  const [open, setOpen]   = useState(inquiry.status === 'new')
  const [reply, setReply] = useState('')
  const [busy, setBusy]   = useState(false)
  const [error, setError] = useState('')

  async function send(ev) {
    ev.preventDefault()
    setBusy(true); setError('')
    try {
      await api.replyInquiry(inquiry.id, { reply })
      setReply('')
      onChanged?.()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'ส่งไม่สำเร็จ')
    } finally { setBusy(false) }
  }

  async function close() {
    setBusy(true)
    try {
      await api.replyInquiry(inquiry.id, { close: true })
      onChanged?.()
    } finally { setBusy(false) }
  }

  return (
    <article className="card p-5">
      <button type="button" onClick={() => setOpen(o => !o)} className="w-full text-left">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-navy-100 grid place-items-center text-navy-700 font-semibold shrink-0">
            {(inquiry.tenant_name || '?').slice(0, 1)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-navy-700">{inquiry.tenant_name || 'ผู้สนใจ'}</span>
              <span className={`text-[11px] font-semibold uppercase tracking-wider border rounded-full px-2 py-0.5 ${STATUS_STYLES[inquiry.status] || ''}`}>
                {STATUS_LABEL[inquiry.status]}
              </span>
            </div>
            <div className="mt-1 text-sm text-muted">
              <Link to={`/rooms/${inquiry.room_id}`} className="hover:text-navy-700 underline">
                {inquiry.room_title}
              </Link>
              {inquiry.zone_name_th && <span> · {inquiry.zone_name_th}</span>}
            </div>
            <p className="mt-3 text-navy-700 text-[15px] leading-relaxed">{inquiry.message}</p>
            {inquiry.reply && (
              <div className="mt-3 rounded-lg bg-navy-50 border border-navy-100 p-3 text-sm">
                <div className="text-xs font-semibold text-muted">ตอบกลับของคุณ:</div>
                <div className="mt-0.5 text-navy-700">{inquiry.reply}</div>
              </div>
            )}
          </div>
        </div>
      </button>

      {open && inquiry.status !== 'closed' && (
        <form onSubmit={send} className="mt-4 pt-4 border-t border-line space-y-3">
          <label className="label" htmlFor={`reply-${inquiry.id}`}>ตอบกลับ</label>
          <textarea
            id={`reply-${inquiry.id}`}
            rows={3}
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            className="input resize-none"
            placeholder="เช่น ยินดีต้อนรับครับ ห้องยังว่างอยู่ สะดวกนัดชมวันไหน?"
            required
            minLength={1}
            maxLength={1000}
          />
          {error && <div className="error">{error}</div>}
          <div className="flex gap-2">
            <button type="submit" disabled={busy || !reply.trim()} className="btn btn-primary btn-sm flex-1 disabled:opacity-60">
              <Check size={14} /> ส่งคำตอบ
            </button>
            {inquiry.status === 'replied' && (
              <button type="button" onClick={close} disabled={busy} className="btn btn-outline btn-sm">
                <X size={14} /> ปิดรายการ
              </button>
            )}
          </div>
        </form>
      )}
    </article>
  )
}