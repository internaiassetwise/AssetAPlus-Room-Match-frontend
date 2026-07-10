// src/components/admin/AdminFaqForm.jsx — Create or edit one FAQ entry.
//
// Marketing-friendly editor (Phase: FAQ redesign):
//   - Defaults to a single Text block so the common case is "type a Thai
//     answer, publish".
//   - "เพิ่มข้อมูลอัตโนมัติ" opens a RECIPE picker (count rooms, avg rent, …)
//     that drops a pre-configured block; power users pick "กำหนดเอง (ขั้นสูง)"
//     for the raw 6-type picker.
//   - ลำดับ + แท็ก live under "ตั้งค่าขั้นสูง".
//
// Save flow:
//   - "บันทึกแบบร่าง" → isDraft:true,  isActive:false  (bot must not see)
//   - "เผยแพร่"        → isDraft:false, isActive:true   (bot can answer)
//
// On publish the server calls Gemini to generate a 768-dim embedding.

import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowRight, Sparkles, Trash, Plus } from '../icons.jsx'
import { useApi } from '../../hooks/useApi.js'
import { api, ApiError } from '../../api/client.js'
import { ConfirmDialog } from '../Modal.jsx'
import { SAMPLES, BLOCK_TYPES, BLOCK_LABELS, SAMPLE_CONTEXT, RECIPES } from '../../data/faqBlockSamples.js'
import { renderBlockCard } from './blocks/blocks.jsx'
import PreviewPane from './PreviewPane.jsx'
import SampleAskWidget from './SampleAskWidget.jsx'

const EMPTY_FORM = {
  question:     '',
  category:     '',
  keywordsText: '',
  sortOrder:    100,
  isActive:     true,
  isDraft:      true,
  answerBlocks: [],
}

// Light hints about common categories so admin can scroll-and-pick instead
// of typing the same thing repeatedly. Free-form text is also accepted.
const CATEGORY_SUGGESTIONS = [
  'pricing',
  'contract',
  'viewing',
  'amenities',
  'location',
  'payment',
  'general',
]

function clientId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return 'b-' + Math.random().toString(36).slice(2, 10)
}

export default function AdminFaqForm({ mode }) {
  const navigate = useNavigate()
  const params   = useParams()
  const isEdit   = mode === 'edit'
  const id       = isEdit ? Number(params.id) : null

  const { data: existing, loading: loadingExisting, refetch } = useApi(
    () => isEdit ? api.getFaq(id) : Promise.resolve(null),
    [id],
  )

  // Create mode seeds a single Text block so the admin lands on "type your answer".
  const [form, setForm]       = useState(() => ({ ...EMPTY_FORM, answerBlocks: [{ ...SAMPLES.text, _id: clientId() }] }))
  const [status, setStatus]   = useState('idle')     // idle | sending | sent | error | regenerating
  const [errors, setErrors]   = useState({})
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleting,         setDeleting]         = useState(false)
  const [delError,         setDelError]         = useState('')
  const [addOpen,          setAddOpen]          = useState(false)
  const [addCustom,        setAddCustom]        = useState(false)

  // Hydrate when editing.
  useEffect(() => {
    if (!isEdit || !existing) return
    setForm({
      question:     existing.question || '',
      category:     existing.category || '',
      keywordsText: (existing.keywords || []).join(', '),
      sortOrder:    existing.sortOrder ?? 100,
      isActive:     existing.isActive ?? true,
      isDraft:      existing.isDraft ?? false,
      // Defensive: server always returns an array; for legacy rows it'll be []
      // and the form will show a single Text block to start writing.
      answerBlocks: Array.isArray(existing.answerBlocks) && existing.answerBlocks.length > 0
        ? existing.answerBlocks.map((b) => ({ ...b, _id: clientId() }))
        : [{ ...SAMPLES.text, _id: clientId() }],
    })
  }, [existing, isEdit])

  // Stable sample context for the preview pane and the sample-ask widget.
  const sampleContext = useMemo(() => SAMPLE_CONTEXT, [])

  // ── Block list ops ─────────────────────────────────────────────────────
  const updateBlock = (i, updated) => {
    setForm((f) => {
      const next = f.answerBlocks.slice()
      next[i] = { ...updated, _id: next[i]._id }
      return { ...f, answerBlocks: next }
    })
  }
  const moveBlock = (i, j) => {
    if (j < 0 || j >= form.answerBlocks.length) return
    setForm((f) => {
      const next = f.answerBlocks.slice()
      const [it] = next.splice(i, 1)
      next.splice(j, 0, it)
      return { ...f, answerBlocks: next }
    })
  }
  const removeBlock = (i) => {
    setForm((f) => ({ ...f, answerBlocks: f.answerBlocks.filter((_, idx) => idx !== i) }))
  }
  const addRecipe = (recipe) => {
    if (!recipe?.make) return                  // 'custom' handled by the menu UI
    setForm((f) => ({ ...f, answerBlocks: [...f.answerBlocks, { ...recipe.make(), _id: clientId() }] }))
    setAddOpen(false); setAddCustom(false)
  }
  const addBlock = (type) => {                 // raw type from the advanced picker
    setForm((f) => ({ ...f, answerBlocks: [...f.answerBlocks, { ...SAMPLES[type], _id: clientId() }] }))
    setAddOpen(false); setAddCustom(false)
  }
  const restoreBlock = (i) => {
    const t = form.answerBlocks[i]?.type
    if (!t || !SAMPLES[t]) return
    if (!window.confirm('คืนค่าตัวอย่างของบล็อกนี้? ข้อมูลที่แก้ไขจะหายไป')) return
    setForm((f) => {
      const next = f.answerBlocks.slice()
      next[i] = { ...SAMPLES[t], _id: next[i]._id }
      return { ...f, answerBlocks: next }
    })
  }

  // ── Form helpers ───────────────────────────────────────────────────────
  function bind(name) {
    return {
      value: form[name],
      onChange: (e) => {
        const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value
        setForm((f) => ({ ...f, [name]: v }))
        if (errors[name]) setErrors((er) => ({ ...er, [name]: '' }))
      },
    }
  }

  function buildBody(draftFlag, activeFlag) {
    return {
      question:     form.question.trim(),
      answer:       '(rendered from blocks)',    // server ignores; `answer` cache regenerated server-side
      answerBlocks: form.answerBlocks.map((b) => {
        // strip client-only `_id` before send
        const { _id, ...rest } = b
        return rest
      }),
      category:     form.category.trim() || undefined,
      keywords:     form.keywordsText.split(',').map((s) => s.trim()).filter(Boolean),
      sortOrder:    Number(form.sortOrder) || 100,
      isActive:     activeFlag,
      isDraft:      draftFlag,
    }
  }

  async function save(draftFlag, activeFlag) {
    const errs = {}
    if (form.question.trim().length < 2) errs.question = 'กรุณากรอกคำถาม'
    if (form.answerBlocks.length === 0) errs.answerBlocks = 'กรุณาเพิ่มคำตอบอย่างน้อย 1 บล็อก'
    if (Object.keys(errs).length) { setErrors(errs); return }
    setStatus('sending'); setErrors({})

    try {
      if (isEdit) {
        await api.updateFaq(id, buildBody(draftFlag, activeFlag))
        await refetch()
      } else {
        await api.createFaq(buildBody(draftFlag, activeFlag))
      }
      setStatus('sent')
      navigate('/admin/faqs', { replace: true })
    } catch (err) {
      setStatus('error')
      setErrors({ form: err instanceof ApiError ? err.message : 'บันทึกไม่สำเร็จ' })
    }
  }

  async function handleRegenerate() {
    setStatus('regenerating')
    try {
      await api.regenerateFaqEmbedding(id)
      await refetch()
      setStatus('idle')
      window.alert('อัปเดตคำตอบให้บอทใช้งานแล้ว บอทจะตอบคำถามนี้ได้ทันที')
    } catch (err) {
      setStatus('idle')
      window.alert(err instanceof ApiError ? err.message : 'ไม่สามารถอัปเดตคำตอบให้บอทได้')
    }
  }

  async function handleDelete() {
    setDeleting(true)
    setDelError('')
    try {
      await api.deleteFaq(id)
      navigate('/admin/faqs', { replace: true })
    } catch (err) {
      setDelError(err instanceof ApiError ? err.message : 'ลบไม่สำเร็จ')
      setDeleting(false)
    }
  }

  if (isEdit && loadingExisting) {
    return <div className="card p-6 text-muted">กำลังโหลด…</div>
  }

  const canPublish =
    form.question.trim().length >= 2 &&
    form.answerBlocks.length >= 1 &&
    status !== 'sending'

  return (
    <section>
      <div className="mb-7">
        <Link to="/admin/faqs" className="text-sm text-muted hover:text-navy-700 inline-flex items-center gap-1">
          <ArrowRight size={14} /> กลับไปรายการ FAQ
        </Link>
        <h1 className="mt-3 font-bold text-navy-700 text-3xl sm:text-4xl tracking-tight">
          {isEdit ? 'แก้ไข FAQ' : 'เพิ่ม FAQ ใหม่'}
        </h1>
        {isEdit && existing && (
          <p className="mt-2 text-muted text-sm">
            สร้างเมื่อ {new Date(existing.createdAt).toLocaleString('th-TH')}
            {existing.embeddingAt && (
              <> · อัปเดตล่าสุด: {new Date(existing.embeddingAt).toLocaleString('th-TH')}</>
            )}
          </p>
        )}
      </div>

      {errors.form && (
        <div className="card p-4 text-ember-700 text-sm mb-4">{errors.form}</div>
      )}

      <div className="grid lg:grid-cols-12 gap-6">
        {/* ── Left column ──────────────────────────────────────────────── */}
        <div className="lg:col-span-7 space-y-5">
          <div className="card p-5 space-y-4">
            <div>
              <label htmlFor="question" className="label">
                <span>คำถามที่ลูกค้าจะพิมพ์ถามบอท</span>
                <span className="text-ember-700 ml-1">*</span>
              </label>
              <textarea
                id="question"
                rows={2}
                className={`input ${errors.question ? 'border-ember-500' : ''}`}
                placeholder='เช่น "ค่าเช่าห้องต้องจ่ายล่วงหน้ากี่เดือน"'
                {...bind('question')}
              />
              {errors.question && <p className="error">{errors.question}</p>}
              <p className="help">ใช้ภาษาเดียวกับที่ลูกค้าจะพิมพ์ถามจริง ๆ บอทจะได้จับคู่คำถามได้ตรง</p>
            </div>

            <div>
              <label htmlFor="category" className="label"><span>หมวด</span></label>
              <input
                id="category"
                type="text"
                list="category-suggest"
                className="input"
                placeholder="เช่น ค่าเช่า / สัญญา / การนัดชม"
                {...bind('category')}
              />
              <datalist id="category-suggest">
                {CATEGORY_SUGGESTIONS.map((c) => <option key={c} value={c} />)}
              </datalist>
            </div>

            {/* Advanced settings: sort + tags (don't affect bot matching) */}
            <details className="group rounded-lg border border-line bg-white">
              <summary className="cursor-pointer select-none px-3 py-2 text-sm font-medium text-navy-700 list-none flex items-center gap-1.5">
                <span className="inline-block transition-transform group-open:rotate-90 text-muted">▸</span>
                ตั้งค่าขั้นสูง (ลำดับ / แท็ก)
              </summary>
              <div className="px-3 pb-3 pt-1 space-y-4 border-t border-line">
                <div>
                  <label htmlFor="sortOrder" className="label"><span>ลำดับการแสดงในหน้าจัดการ</span></label>
                  <input
                    id="sortOrder"
                    type="number"
                    min={0}
                    className="input"
                    {...bind('sortOrder')}
                  />
                  <p className="help">ตัวเลขน้อยขึ้นก่อน (ใช้ในหน้าจัดการเท่านั้น — ไม่มีผลต่อการตอบของบอท)</p>
                </div>
                <div>
                  <label htmlFor="keywords" className="label"><span>แท็ก (คั่นด้วย ,)</span></label>
                  <input
                    id="keywords"
                    type="text"
                    className="input"
                    placeholder="เช่น ค่าเช่า, รายเดือน"
                    {...bind('keywordsText')}
                  />
                  <p className="help">ไม่มีผลต่อการจับคู่คำถามของบอท — เก็บไว้สำหรับจัดหมวดในอนาคต</p>
                </div>
              </div>
            </details>
          </div>

          {/* Answer (block list) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-navy-700 text-lg">คำตอบ</h2>
                <p className="text-xs text-muted">พิมพ์คำตอบเป็นข้อความธรรมดา หรือกด "เพิ่มข้อมูลอัตโนมัติ" เพื่อให้บอทดึงตัวเลขจริง เช่น จำนวนห้องว่าง</p>
              </div>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setAddOpen((v) => !v)}
                  className="btn btn-outline btn-sm"
                  aria-expanded={addOpen}
                  aria-haspopup="menu"
                >
                  <Plus size={16} /> เพิ่มข้อมูลอัตโนมัติ
                </button>
                {addOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => { setAddOpen(false); setAddCustom(false) }} aria-hidden />
                    <div role="menu" className="absolute right-0 mt-2 w-72 card p-1 z-20 shadow-lift max-h-[60vh] overflow-auto">
                      {!addCustom ? (
                        RECIPES.map((r) => (
                          <button
                            key={r.key}
                            type="button"
                            role="menuitem"
                            onClick={() => (r.make ? addRecipe(r) : setAddCustom(true))}
                            className="w-full text-left px-3 py-2 rounded-md hover:bg-navy-50"
                          >
                            <div className="text-sm font-medium text-navy-700 flex items-center gap-1.5">
                              <span>{r.icon}</span>{r.label}
                            </div>
                            <div className="text-xs text-muted">{r.hint}</div>
                          </button>
                        ))
                      ) : (
                        <>
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => setAddCustom(false)}
                            className="w-full text-left px-3 py-1.5 rounded-md hover:bg-navy-50 text-xs text-muted"
                          >
                            ← กลับ
                          </button>
                          {BLOCK_TYPES.map((t) => (
                            <button
                              key={t}
                              type="button"
                              role="menuitem"
                              onClick={() => addBlock(t)}
                              className="w-full text-left px-3 py-2 rounded-md hover:bg-navy-50"
                            >
                              <div className="text-sm font-medium text-navy-700">{BLOCK_LABELS[t].label}</div>
                              <div className="text-xs text-muted">{BLOCK_LABELS[t].hint}</div>
                            </button>
                          ))}
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {errors.answerBlocks && (
              <p className="error">{errors.answerBlocks}</p>
            )}

            {form.answerBlocks.length === 0 ? (
              <div className="card p-6 text-center text-muted text-sm">
                ยังไม่มีคำตอบ — กด "เพิ่มข้อมูลอัตโนมัติ" หรือเริ่มจากข้อความธรรมดา
              </div>
            ) : (
              <div className="space-y-3">
                {form.answerBlocks.map((block, i) => (
                  <div key={block._id}>
                    {renderBlockCard({
                      block, index: i, total: form.answerBlocks.length,
                      onChange: (u) => updateBlock(i, u),
                      onMove:   moveBlock,
                      onRemove: () => removeBlock(i),
                      onRestore: () => restoreBlock(i),
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Save buttons */}
          <div className="card p-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => save(true, false)}
              disabled={status === 'sending' || form.answerBlocks.length === 0}
              className="btn btn-outline"
              title="บันทึกแบบร่าง — บอทจะยังไม่ตอบ FAQ นี้"
            >
              {status === 'sending' ? 'กำลังบันทึก…' : 'บันทึกแบบร่าง'}
            </button>
            <button
              type="button"
              onClick={() => save(false, true)}
              disabled={!canPublish}
              className="btn btn-primary"
              title={canPublish ? 'เผยแพร่ — บอทเริ่มตอบได้ทันที' : 'ต้องกรอกคำถามและมีคำตอบอย่างน้อย 1 บล็อก'}
            >
              {status === 'sending' ? 'กำลังเผยแพร่…' : 'เผยแพร่'}
            </button>
            <Link to="/admin/faqs" className="btn btn-ghost">ยกเลิก</Link>
            {isEdit && (
              <>
                <button
                  type="button"
                  onClick={handleRegenerate}
                  disabled={status === 'regenerating'}
                  className="btn btn-outline"
                  title="อัปเดต embedding ของคำตอบนี้ให้บอทใช้"
                >
                  <Sparkles size={16} /> อัปเดตคำตอบให้บอทใช้งาน
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(true)}
                  className="btn btn-ghost text-ember-700 ml-auto"
                >
                  <Trash size={16} /> ลบ
                </button>
              </>
            )}
          </div>
        </div>

        {/* ── Right column (sticky preview) ─────────────────────────── */}
        <div className="lg:col-span-5 space-y-4">
          <PreviewPane
            answerBlocks={form.answerBlocks.map((b) => {
              const { _id, ...rest } = b
              return rest
            })}
            context={sampleContext}
          />
          <SampleAskWidget
            question={form.question}
            answerBlocks={form.answerBlocks.map((b) => {
              const { _id, ...rest } = b
              return rest
            })}
            context={sampleContext}
          />
        </div>
      </div>

      <ConfirmDialog
        open={confirmingDelete}
        title="ลบ FAQ?"
        message={existing ? `ลบ "${existing.question}"?` : ''}
        confirmLabel={deleting ? 'กำลังลบ…' : 'ลบ'}
        confirmTone="danger"
        busy={deleting}
        error={delError}
        onCancel={() => !deleting && setConfirmingDelete(false)}
        onConfirm={handleDelete}
      />
    </section>
  )
}
