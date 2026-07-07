// src/components/ViewingPicker.jsx — Date + time slot picker for viewing requests.
//
// Renders inline on the room detail page (no modal). Tenant picks a date and
// one of the preset slots, optionally writes a note, hits "นัดชมห้อง".

import { useState } from 'react'
import { Calendar, Clock, ArrowRight, BadgeCheck } from './icons.jsx'
import { api, ApiError } from '../api/client.js'

const SLOTS = ['10:00', '13:00', '16:00', '19:00']

/** Today's date as YYYY-MM-DD for the <input type="date" min="..."> attribute. */
function today() {
  const d = new Date()
  return d.toISOString().slice(0, 10)
}

export default function ViewingPicker({ roomId, onSuccess }) {
  const [open, setOpen]     = useState(false)
  const [date, setDate]     = useState(today())
  const [slot, setSlot]     = useState('13:00')
  const [note, setNote]     = useState('')
  const [status, setStatus] = useState('idle')
  const [error, setError]   = useState('')

  async function submit(ev) {
    ev.preventDefault()
    setStatus('sending')
    setError('')
    try {
      // Combine date + slot into ISO-8601 (Bangkok offset, server normalizes).
      const scheduledFor = new Date(`${date}T${slot}:00+07:00`).toISOString()
      const created = await api.createViewing({ roomId, scheduledFor, note })
      setStatus('sent')
      onSuccess?.(created)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'ส่งคำขอไม่สำเร็จ')
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 flex items-start gap-3">
        <BadgeCheck size={20} className="text-emerald-600 mt-0.5 shrink-0" />
        <div className="text-sm text-emerald-800">
          <div className="font-semibold">ส่งคำขอนัดชมห้องแล้ว</div>
          <div className="mt-0.5">เจ้าของห้องจะตอบกลับภายใน 24 ชม. ดูสถานะได้ที่หน้า “นัดชมห้อง”</div>
        </div>
      </div>
    )
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn btn-primary w-full"
      >
        <Calendar size={16} /> นัดชมห้อง
      </button>
    )
  }

  return (
    <form onSubmit={submit} className="rounded-xl border border-navy-100 bg-white p-4 space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-navy-700">
          <Calendar size={16} /> เลือกวันและเวลานัดชม
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-muted hover:text-navy-700"
        >
          ยกเลิก
        </button>
      </div>

      <div>
        <label className="label" htmlFor="vp-date">วันที่</label>
        <input
          id="vp-date"
          type="date"
          min={today()}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="input"
          required
        />
      </div>

      <div>
        <label className="label">ช่วงเวลา</label>
        <div className="grid grid-cols-4 gap-2">
          {SLOTS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSlot(s)}
              className={`chip justify-center ${slot === s ? 'chip-active' : ''}`}
            >
              <Clock size={14} /> {s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="label" htmlFor="vp-note">หมายเหตุ (ถ้ามี)</label>
        <textarea
          id="vp-note"
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="input resize-none"
          placeholder="เช่น มากับเพื่อน 1 คน, สนใจทำสัญญาทันที"
        />
      </div>

      {error && (
        <div className="text-ember-700 text-xs bg-ember-50 border border-ember-200 rounded px-3 py-2">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="btn btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === 'sending' ? 'กำลังส่งคำขอ…' : 'ยืนยันนัดชม'}
        <ArrowRight size={16} />
      </button>
    </form>
  )
}