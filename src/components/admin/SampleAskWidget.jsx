// src/components/admin/SampleAskWidget.jsx — "ลองถามคำถามจริง" widget.
//
// Lets the marketing admin paste a real-world question and see the EXACT
// reply the bot would send, including embedding → vector-search →
// rephrase. Uses the *draft* answerBlocks, not the saved row, so they can
// preview unpublished changes.

import { useState } from 'react'
import { Send, Sparkles } from '../icons.jsx'
import { api, ApiError } from '../../api/client.js'

export default function SampleAskWidget({ question, answerBlocks, context }) {
  const [askInput,    setAskInput]    = useState('')
  const [askLoading,  setAskLoading]  = useState(false)
  const [askReply,    setAskReply]    = useState(null)   // { rendered, found, faqId, confidence, category } | null
  const [askError,    setAskError]    = useState('')

  async function submit() {
    const q = askInput.trim()
    if (!q || askLoading) return
    if (!Array.isArray(answerBlocks) || answerBlocks.length === 0) {
      setAskError('เพิ่มบล็อกคำตอบอย่างน้อย 1 บล็อกก่อน')
      return
    }
    setAskLoading(true)
    setAskError('')
    setAskReply(null)
    try {
      const res = await api.sampleAskFaq({
        query: q,
        answerBlocks,
        context,
        _question: question,        // server currently ignores; reserved for future use
      })
      setAskReply(res)
    } catch (err) {
      setAskError(err instanceof ApiError ? err.message : 'ไม่สามารถทดสอบได้')
    } finally {
      setAskLoading(false)
    }
  }

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-line bg-cream-50/60">
        <Sparkles size={16} className="text-navy-700" />
        <div className="text-sm font-semibold text-navy-700">ลองถามคำถามจริง</div>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <input
            value={askInput}
            onChange={(e) => setAskInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') submit() }}
            placeholder='พิมพ์คำถามที่ผู้ใช้จะถามบอท เช่น "มีห้องว่างกี่ห้อง"'
            className="input text-sm flex-1"
            disabled={askLoading}
          />
          <button
            type="button"
            onClick={submit}
            disabled={askLoading || !askInput.trim()}
            className="btn btn-primary btn-sm"
            title="ทดสอบ"
          >
            <Send size={14} />
            {askLoading ? 'กำลังถาม…' : 'ถาม'}
          </button>
        </div>

        {askError && (
          <p className="text-sm text-ember-700">⚠ {askError}</p>
        )}

        {askReply && (
          <div className="space-y-2">
            <div className="flex">
              <div className="max-w-[85%] bg-cream-50 border border-line rounded-2xl rounded-tl-md px-3 py-2 text-[15px] text-navy-700 whitespace-pre-line leading-relaxed">
                {askReply.rendered || <span className="text-muted">— ไม่มีคำตอบ —</span>}
              </div>
            </div>
            <div className="text-[11px] text-muted flex flex-wrap items-center gap-2 px-1">
              {askReply.found ? (
                <>
                  <span className="text-emerald-700">✓ จับคู่ FAQ ได้</span>
                  {askReply.faqId && <span>faqId: {askReply.faqId}</span>}
                  {askReply.confidence != null && (
                    <span>confidence: {askReply.confidence.toFixed(3)}</span>
                  )}
                  {askReply.category && <span>หมวด: {askReply.category}</span>}
                </>
              ) : (
                <span className="text-ember-700">⚠ ไม่มี FAQ ที่ใกล้เคียงพอ — บอทจะส่งต่อให้แอดมิน</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}