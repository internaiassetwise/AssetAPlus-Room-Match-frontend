// src/components/admin/PreviewPane.jsx — Live preview of the current draft's
// rendered answer. Debounced 300ms so we don't hammer the server on every
// keystroke. Sticks to the right rail of the form.

import { useEffect, useRef, useState } from 'react'
import { Eye } from '../icons.jsx'
import { api, ApiError } from '../../api/client.js'

export default function PreviewPane({ answerBlocks, context }) {
  const [rendered, setRendered] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const abortRef = useRef(null)

  useEffect(() => {
    if (!Array.isArray(answerBlocks) || answerBlocks.length === 0) {
      setRendered('')
      setError('')
      setLoading(false)
      return
    }
    setLoading(true)
    setError('')
    if (abortRef.current) abortRef.current.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl
    const timer = setTimeout(async () => {
      try {
        const { rendered } = await api.previewFaq({ answerBlocks, context })
        if (!ctrl.signal.aborted) setRendered(rendered)
      } catch (err) {
        if (ctrl.signal.aborted) return
        setError(err instanceof ApiError ? err.message : 'เรนเดอร์ไม่สำเร็จ')
      } finally {
        if (!ctrl.signal.aborted) setLoading(false)
      }
    }, 300)
    return () => {
      clearTimeout(timer)
      ctrl.abort()
    }
  }, [answerBlocks, context])

  const empty = !answerBlocks || answerBlocks.length === 0

  return (
    <div className="card overflow-hidden sticky top-4">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-line bg-cream-50/60">
        <Eye size={16} className="text-navy-700" />
        <div className="text-sm font-semibold text-navy-700">ตัวอย่างคำตอบ (Live)</div>
      </div>
      <div className="p-4">
        {empty && (
          <p className="text-sm text-muted">
            เพิ่มบล็อกอย่างน้อย 1 บล็อก เพื่อดูตัวอย่างคำตอบที่บอทจะส่งกลับผู้ใช้
          </p>
        )}
        {!empty && loading && (
          <div className="space-y-2 animate-pulse">
            <div className="h-3 bg-line rounded w-2/3" />
            <div className="h-3 bg-line rounded w-1/2" />
            <div className="h-3 bg-line rounded w-3/4" />
          </div>
        )}
        {!empty && error && (
          <p className="text-sm text-ember-700">⚠ {error}</p>
        )}
        {!empty && !loading && !error && (
          <div className="text-[15px] text-navy-700 whitespace-pre-line leading-relaxed">
            {rendered || <span className="text-muted">—</span>}
          </div>
        )}
      </div>
      <div className="px-4 py-2 border-t border-line bg-cream-50/40">
        <p className="text-[11px] text-muted">
          ตัวอย่างนี้ใช้ข้อมูลตัวอย่าง: roomId=1, viewingId=1
        </p>
      </div>
    </div>
  )
}