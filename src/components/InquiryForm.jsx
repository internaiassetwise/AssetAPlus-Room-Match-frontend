// src/components/InquiryForm.jsx — Tenant message box → landlord inbox.

import { useState } from 'react'
import { MessageSquare, ArrowRight, BadgeCheck } from './icons.jsx'
import { api, ApiError } from '../api/client.js'

export default function InquiryForm({ roomId, onSuccess }) {
  const [open, setOpen]     = useState(false)
  const [message, setMessage] = useState('')
  const [status, setStatus]   = useState('idle')
  const [error, setError]     = useState('')

  async function submit(ev) {
    ev.preventDefault()
    setStatus('sending')
    setError('')
    try {
      const created = await api.createInquiry({ roomId, message })
      setStatus('sent')
      onSuccess?.(created)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'ส่งข้อความไม่สำเร็จ')
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 flex items-start gap-3">
        <BadgeCheck size={20} className="text-emerald-600 mt-0.5 shrink-0" />
        <div className="text-sm text-emerald-800">
          <div className="font-semibold">ส่งข้อความถึงเจ้าของห้องแล้ว</div>
          <div className="mt-0.5">เจ้าของห้องจะตอบกลับผ่านกล่องข้อความในระบบ</div>
        </div>
      </div>
    )
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn btn-outline w-full"
      >
        <MessageSquare size={16} /> ส่งข้อความถึงเจ้าของห้อง
      </button>
    )
  }

  return (
    <form onSubmit={submit} className="rounded-xl border border-navy-100 bg-white p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-navy-700">
          <MessageSquare size={16} /> ข้อความถึงเจ้าของห้อง
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-muted hover:text-navy-700"
        >
          ยกเลิก
        </button>
      </div>

      <textarea
        rows={4}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="input resize-none"
        placeholder="เช่น ห้องยังว่างอยู่ไหมคะ สนใจมาก อยากทราบรายละเอียดค่าเช่ารายเดือน"
        required
        minLength={5}
        maxLength={1000}
      />

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
        {status === 'sending' ? 'กำลังส่ง…' : 'ส่งข้อความ'}
        <ArrowRight size={16} />
      </button>
    </form>
  )
}