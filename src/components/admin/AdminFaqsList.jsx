// src/components/admin/AdminFaqsList.jsx — Manage the bot's FAQ knowledge base.
//
// Each row is one Q/A pair. When the bot receives a free-text question it
// vector-searches this table for the best match (Gemini text-embedding-004,
// cosine similarity) and replies with the rephrased answer. If no FAQ is a
// good match, the bot escalates the question to admin on Line.
//
// Admin can:
//   - Create / edit / delete FAQs.
//   - Toggle `isActive` to scope what the bot is allowed to answer.
//   - Click "สร้าง embedding ใหม่" if the row shows `hasEmbedding: false`
//     (e.g. the row was created before GOOGLE_GEMINI_API_KEY was set).
//   - One-shot import a 12-question starter pack (hidden once the list has
//     any rows so re-clicks can't duplicate).

import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Pencil, Trash, Sparkles, Search } from '../icons.jsx'
import { ConfirmDialog } from '../Modal.jsx'
import { useApi } from '../../hooks/useApi.js'
import { api, ApiError } from '../../api/client.js'
import { STARTER_FAQS } from '../../data/starterFaqs.js'

export default function AdminFaqsList() {
  const navigate = useNavigate()
  const [draftTab, setDraftTab] = useState('published')   // 'all' | 'published' | 'draft'
  const { data: faqs, loading, error, refetch } = useApi(
    () => api.listFaqs({ limit: 500 }),
    [],
  )
  const [confirming, setConfirming] = useState(null)
  const [deleting,   setDeleting]   = useState(false)
  const [delError,   setDelError]   = useState('')
  const [regenId,    setRegenId]    = useState(null)
  const [filter,     setFilter]     = useState('')

  // Starter-pack one-shot import. Only meaningful when the list is empty.
  const [starterOpen, setStarterOpen] = useState(false)
  const [importing,   setImporting]   = useState(false)
  const [importProgress, setImportProgress] = useState({ done: 0, total: 0, current: '' })
  const [importError, setImportError] = useState('')

  // Cheap client-side filter by tab + text.
  const visible = useMemo(() => {
    if (!Array.isArray(faqs)) return []
    const f = filter.trim().toLowerCase()
    return faqs.filter((q) => {
      if (draftTab === 'published' && (q.isDraft || !q.isActive)) return false
      if (draftTab === 'draft'     && !q.isDraft)                 return false
      if (!f) return true
      return (
        (q.question || '').toLowerCase().includes(f) ||
        (q.answer   || '').toLowerCase().includes(f) ||
        (q.category || '').toLowerCase().includes(f)
      )
    })
  }, [faqs, filter, draftTab])

  const draftCount = useMemo(
    () => Array.isArray(faqs) ? faqs.filter((q) => q.isDraft).length : 0,
    [faqs],
  )

  async function handleDelete() {
    if (!confirming) return
    setDeleting(true)
    setDelError('')
    try {
      await api.deleteFaq(confirming.id)
      setConfirming(null)
      refetch()
    } catch (err) {
      setDelError(err instanceof ApiError ? err.message : 'ลบไม่สำเร็จ')
    } finally {
      setDeleting(false)
    }
  }

  async function handleRegenerate(id) {
    setRegenId(id)
    try {
      await api.regenerateFaqEmbedding(id)
      refetch()
    } catch (err) {
      window.alert(
        err instanceof ApiError
          ? `ไม่สามารถเตรียมใช้งานได้: ${err.message}`
          : 'ไม่สามารถเตรียมใช้งานได้')
    } finally {
      setRegenId(null)
    }
  }

  // One-shot: POST each starter FAQ through the admin API. Sequenced
  // (not Promise.all) so the server's Gemini embedding queue stays sane.
  // Sleeps 250ms between inserts as a small breather.
  async function handleImportStarter() {
    setImporting(true)
    setImportError('')
    setImportProgress({ done: 0, total: STARTER_FAQS.length, current: '' })

    let ok = 0
    for (let i = 0; i < STARTER_FAQS.length; i++) {
      const f = STARTER_FAQS[i]
      setImportProgress({ done: i, total: STARTER_FAQS.length, current: f.question })
      try {
        await api.createFaq(f)
        ok++
      } catch (err) {
        setImportError(
          `นำเข้าได้ ${ok}/${STARTER_FAQS.length}: ข้อที่ ${i + 1} (${f.question}) ล้มเหลว — ${
            err instanceof ApiError ? err.message : err.message
          }`,
        )
        setImporting(false)
        return
      }
      await new Promise((r) => setTimeout(r, 250))
    }

    setImportProgress({ done: STARTER_FAQS.length, total: STARTER_FAQS.length, current: '' })
    await refetch()
    setImporting(false)
    setStarterOpen(false)
  }

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-7">
        <div>
          <span className="eyebrow-navy">ฐานความรู้แชทบอท</span>
          <h1 className="mt-3 font-bold text-navy-700 text-3xl sm:text-4xl tracking-tight">
            FAQ · คำถามที่บอทตอบได้
          </h1>
          <p className="mt-2 text-muted max-w-2xl">
            เมื่อผู้ใช้พิมพ์คำถามเข้ามา บอทจะค้นหา FAQ ที่ใกล้เคียงที่สุดและตอบกลับด้วยภาษาไทย
            ถัดไป หากไม่มี FAQ ที่ตรง บอทจะส่งต่อให้แอดมินทาง Line
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link to="/admin/faqs/new" className="btn btn-primary">
            <Plus size={18} /> เพิ่ม FAQ
          </Link>
          {/* Starter pack — hidden once the list has anything in it, so we
              never duplicate rows if admin clicks twice. */}
          {Array.isArray(faqs) && faqs.length === 0 && !loading && (
            <button
              type="button"
              onClick={() => setStarterOpen(true)}
              className="btn btn-outline"
            >
              <Sparkles size={18} /> นำเข้า FAQ ตัวอย่าง ({STARTER_FAQS.length} ข้อ)
            </button>
          )}
        </div>
      </div>

      {/* Tabs + filter */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-lg border border-line bg-white p-1 text-sm">
          {[
            { key: 'published', label: 'เผยแพร่แล้ว' },
            { key: 'draft',     label: `ร่างที่ยังไม่ได้เผยแพร่${draftCount ? ` (${draftCount})` : ''}` },
            { key: 'all',       label: 'ทั้งหมด' },
          ].map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setDraftTab(t.key)}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                draftTab === t.key
                  ? 'bg-navy-600 text-white'
                  : 'text-muted hover:text-navy-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 card px-3 py-2 flex-1 min-w-[260px] max-w-md">
          <Search size={18} className="text-muted shrink-0" />
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="ค้นหาจากคำถาม / คำตอบ / หมวด"
            className="bg-transparent outline-none text-sm w-full placeholder:text-muted"
          />
        </div>
      </div>

      {error && (
        <div className="card p-6 text-ember-700 text-sm">
          โหลดข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-navy-50/60 border-b border-line text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-5 py-3.5 font-semibold">คำถาม</th>
                <th className="px-5 py-3.5 font-semibold">หมวด</th>
                <th className="px-5 py-3.5 font-semibold text-center">สถานะ</th>
                <th className="px-5 py-3.5 font-semibold text-center">พร้อมใช้งาน</th>
                <th className="px-5 py-3.5 font-semibold text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {loading && (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-muted text-sm">กำลังโหลด…</td></tr>
              )}
              {!loading && visible.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-muted text-sm">
                  {draftTab === 'draft'
                    ? 'ไม่มีร่างที่ยังไม่ได้เผยแพร่'
                    : 'ยังไม่มี FAQ'}
                </td></tr>
              )}
              {visible.map((f) => (
                <tr key={f.id} className="hover:bg-cream-50/40">
                  <td className="px-5 py-4 max-w-md">
                    <div className="flex items-start gap-2">
                      <div className="font-medium text-navy-700 line-clamp-2 flex-1">{f.question}</div>
                      {f.isDraft && (
                        <span className="shrink-0 mt-0.5 inline-block px-2 py-0.5 text-[10px] rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium">
                          ร่าง
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-muted mt-1 line-clamp-2">{f.answer}</div>
                  </td>
                  <td className="px-5 py-4 text-sm text-navy-700 whitespace-nowrap">
                    {f.category || <span className="text-muted">—</span>}
                  </td>
                  <td className="px-5 py-4 text-center">
                    {f.isActive && !f.isDraft
                      ? <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">เปิดใช้งาน</span>
                      : f.isDraft
                        ? <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-amber-50 text-amber-700 border border-amber-200">ร่าง</span>
                        : <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-navy-50 text-muted border border-navy-200">ปิด</span>}
                  </td>
                  <td className="px-5 py-4 text-center">
                    {f.hasEmbedding
                      ? <span className="text-emerald-700 text-xs" title={f.embeddingAt || ''}>พร้อม</span>
                      : (
                        <button
                          onClick={() => handleRegenerate(f.id)}
                          disabled={regenId === f.id}
                          className="btn btn-ghost btn-xs"
                        >
                          <Sparkles size={14} />
                          {regenId === f.id ? 'กำลังเตรียม…' : 'เตรียมใช้งาน'}
                        </button>
                      )}
                  </td>
                  <td className="px-5 py-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => navigate(`/admin/faqs/${f.id}/edit`)}
                      className="btn btn-ghost btn-sm"
                      aria-label="แก้ไข"
                    >
                      <Pencil size={16} /> แก้ไข
                    </button>
                    <button
                      onClick={() => setConfirming(f)}
                      className="btn btn-ghost btn-sm text-ember-700"
                      aria-label="ลบ"
                    >
                      <Trash size={16} /> ลบ
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        open={!!confirming}
        title="ลบ FAQ?"
        message={confirming ? `ลบ "${confirming.question}"? การกระทำนี้ไม่สามารถยกเลิกได้` : ''}
        confirmLabel={deleting ? 'กำลังลบ…' : 'ลบ'}
        confirmTone="danger"
        busy={deleting}
        error={delError}
        onCancel={() => !deleting && setConfirming(null)}
        onConfirm={handleDelete}
      />

      {/* Starter-pack import — shows the running question so admin sees
          progress even though the API takes a sec per row (Gemini embed). */}
      <ConfirmDialog
        open={starterOpen}
        title="นำเข้า FAQ ตัวอย่าง"
        message={
          importing
            ? `กำลังนำเข้า ${importProgress.done}/${importProgress.total}${
                importProgress.current ? ` — ${importProgress.current}` : ''
              }`
            : `จะเพิ่ม FAQ ตัวอย่างทั้งหมด ${STARTER_FAQS.length} ข้อ (การนัดชมห้อง, ค่าเช่า, สัญญา, การลงประกาศ, ทั่วไป) และให้ Gemini สร้าง embedding ให้แต่ละข้อ`
        }
        confirmLabel={
          importing
            ? importProgress.done >= importProgress.total
              ? 'เสร็จแล้ว'
              : 'กำลังนำเข้า…'
            : `นำเข้า ${STARTER_FAQS.length} ข้อ`
        }
        confirmTone="primary"
        busy={importing}
        error={importError}
        onCancel={() => !importing && setStarterOpen(false)}
        onConfirm={handleImportStarter}
      />
    </section>
  )
}