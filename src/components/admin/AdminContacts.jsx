// src/components/admin/AdminContacts.jsx — Contact directory (tenants + landlords).
//
// Rendered as the "รายชื่อ" tab inside AdminInbox. A role toggle switches between
// the tenant directory and the landlord directory:
//   • Tenants  — read + inline edit of name/phone (info collected via Line chat).
//   • Landlords — read + edit, PLUS create. Creating a landlord is how the
//     pre-webapp ("legacy") owners are onboarded: admin enters name + phone now;
//     the LINE identity is bound later (see docs/LEGACY_LANDLORD_ONBOARDING.md),
//     so line_id is normally left blank here.

import { useState, useMemo } from 'react'
import { useApi } from '../../hooks/useApi.js'
import { api, ApiError } from '../../api/client.js'
import { Search, Users, Home, X, Check, Phone, LineChat, Pencil, Plus, Trash } from '../icons.jsx'

// Copy a LINE id to the clipboard on click (same affordance as the old tenant table).
function LineBadge({ lineId }) {
  if (!lineId) return <span className="text-xs text-muted">—</span>
  return (
    <button
      onClick={() => navigator.clipboard?.writeText(lineId).catch(() => {})}
      className="inline-flex items-center gap-1 text-xs font-medium text-[#06C755] bg-[#06C755]/10 hover:bg-[#06C755]/20 rounded-md px-2 py-0.5 transition-colors"
      title={`คัดลอก: ${lineId}`}
    >
      <LineChat size={11} /> {lineId.slice(0, 12)}…
    </button>
  )
}

export default function AdminContacts() {
  const [role, setRole] = useState('tenant') // 'tenant' | 'landlord'
  const [filter, setFilter] = useState('')

  const roleTab = (key, label, Icon) => {
    const active = role === key
    return (
      <button
        type="button"
        onClick={() => { setRole(key); setFilter('') }}
        aria-pressed={active}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
          active ? 'bg-navy-700 text-white border-navy-700' : 'bg-white text-navy-700 border-line hover:bg-navy-50'
        }`}
      >
        <Icon size={15} /> {label}
      </button>
    )
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {roleTab('tenant', 'ผู้เช่า', Users)}
        {roleTab('landlord', 'เจ้าของห้อง', Home)}
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="card px-3 py-2 flex items-center gap-2 flex-1 max-w-md min-w-[260px]">
          <Search size={18} className="text-muted shrink-0" />
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="ค้นหาจากชื่อ / เบอร์ / Line ID"
            className="bg-transparent outline-none text-sm w-full placeholder:text-muted"
          />
        </div>
      </div>

      {role === 'tenant'
        ? <TenantDirectory filter={filter} />
        : <LandlordDirectory filter={filter} />}
    </div>
  )
}

// ─────────────────────────────── Tenants ────────────────────────────────────

function TenantDirectory({ filter }) {
  const { data: tenants, loading, refetch } = useApi(() => api.listTenants(), [])
  const [editing, setEditing] = useState(null)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')

  const list = tenants || []
  const visible = useMemo(() => {
    const f = filter.trim().toLowerCase()
    if (!f) return list
    return list.filter((t) =>
      (t.full_name || '').toLowerCase().includes(f) ||
      (t.phone || '').toLowerCase().includes(f) ||
      (t.line_id || '').toLowerCase().includes(f) ||
      (t.email || '').toLowerCase().includes(f),
    )
  }, [list, filter])

  const [deletingId, setDeletingId] = useState(null)

  async function saveEdit() {
    if (!editing) return
    setSaving(true); setError('')
    try {
      await api.updateTenant(editing.id, {
        fullName: editing.fullName.trim() || undefined,
        phone:    editing.phone.trim()    || undefined,
      })
      setEditing(null)
      await refetch()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'บันทึกไม่สำเร็จ')
    } finally { setSaving(false) }
  }

  async function removeTenant(t) {
    const who = t.full_name || `ผู้เช่า #${t.id}`
    if (!window.confirm(`ลบบัญชีผู้เช่า “${who}” ?\n\nการนัดชม/การจับคู่ของผู้เช่ารายนี้จะถูกลบไปด้วย และกู้คืนไม่ได้`)) return
    setDeletingId(t.id); setError('')
    try {
      await api.deleteTenant(t.id)
      await refetch()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'ลบไม่สำเร็จ')
    } finally { setDeletingId(null) }
  }

  return (
    <>
      {error && (
        <div className="mb-4 text-ember-700 text-sm bg-ember-50 border border-ember-200 rounded-lg px-3 py-2">{error}</div>
      )}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-navy-50/60 border-b border-line text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-5 py-3.5 font-semibold">ชื่อ</th>
                <th className="px-5 py-3.5 font-semibold">เบอร์โทร</th>
                <th className="px-5 py-3.5 font-semibold">Line</th>
                <th className="px-5 py-3.5 font-semibold">แหล่งที่มา</th>
                <th className="px-5 py-3.5 font-semibold w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {loading && (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-muted text-sm">กำลังโหลด…</td></tr>
              )}
              {!loading && visible.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-muted">
                    <Users size={32} className="mx-auto mb-2 text-navy-200" />
                    <div className="text-sm">
                      {list.length === 0 ? 'ยังไม่มีผู้เช่าในระบบ' : 'ไม่พบผู้เช่าที่ตรงกับการค้นหา'}
                    </div>
                  </td>
                </tr>
              )}
              {visible.map((t) => (
                <tr key={t.id} className="hover:bg-cream-50/40">
                  <td className="px-5 py-4">
                    <div className="text-sm font-medium text-navy-700">
                      {t.full_name || <span className="text-muted">ไม่ระบุชื่อ</span>}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    {t.phone ? (
                      <a href={`tel:${t.phone}`} className="inline-flex items-center gap-1.5 text-sm text-navy-600 hover:text-navy-800">
                        <Phone size={13} /> {t.phone}
                      </a>
                    ) : <span className="text-xs text-muted">—</span>}
                  </td>
                  <td className="px-5 py-4"><LineBadge lineId={t.line_id} /></td>
                  <td className="px-5 py-4">
                    <span className="text-xs text-muted">
                      {t.source === 'line-bot' ? 'เข้าผ่านบอท' : t.source || '—'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setEditing({ id: t.id, fullName: t.full_name || '', phone: t.phone || '' })}
                        className="inline-flex items-center gap-1 text-xs text-muted hover:text-navy-700 transition-colors"
                      >
                        <Pencil size={12} /> แก้ไข
                      </button>
                      <button
                        onClick={() => removeTenant(t)}
                        disabled={deletingId === t.id}
                        className="inline-flex items-center gap-1 text-xs text-muted hover:text-ember-600 transition-colors disabled:opacity-50"
                        title="ลบบัญชีผู้เช่า"
                      >
                        <Trash size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <Modal title="แก้ไขข้อมูลติดต่อ" onClose={() => setEditing(null)}>
          <p className="text-xs text-muted mb-4">ข้อมูลที่กรอกจะผูกกับ Line ID ของผู้เช่าคนนี้ (#{editing.id})</p>
          <div className="space-y-3">
            <Field label="ชื่อ">
              <input className="input" value={editing.fullName}
                onChange={(e) => setEditing({ ...editing, fullName: e.target.value })} placeholder="เช่น คุณสมชาย" />
            </Field>
            <Field label="เบอร์โทร">
              <input className="input" inputMode="tel" value={editing.phone}
                onChange={(e) => setEditing({ ...editing, phone: e.target.value })} placeholder="เช่น 081-234-5678" />
            </Field>
          </div>
          <button type="button" onClick={saveEdit} disabled={saving}
            className="btn btn-primary w-full mt-5 disabled:opacity-60">
            {saving ? 'กำลังบันทึก…' : 'บันทึก'} {saving ? '' : <Check size={16} />}
          </button>
        </Modal>
      )}
    </>
  )
}

// ─────────────────────────────── Landlords ──────────────────────────────────

const EMPTY_LANDLORD = { fullName: '', phone: '', email: '', lineId: '', note: '' }

function LandlordDirectory({ filter }) {
  const { data: landlords, loading, refetch } = useApi(() => api.listLandlords(), [])
  const [form, setForm]     = useState(null)   // { mode: 'create'|'edit', id?, ...fields }
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  const list = landlords || []
  const visible = useMemo(() => {
    const f = filter.trim().toLowerCase()
    if (!f) return list
    return list.filter((l) =>
      (l.fullName || '').toLowerCase().includes(f) ||
      (l.phone || '').toLowerCase().includes(f) ||
      (l.lineId || '').toLowerCase().includes(f) ||
      (l.email || '').toLowerCase().includes(f),
    )
  }, [list, filter])

  const [deletingId, setDeletingId] = useState(null)

  function openCreate() { setError(''); setForm({ mode: 'create', ...EMPTY_LANDLORD }) }
  function openEdit(l) {
    setError('')
    setForm({ mode: 'edit', id: l.id, fullName: l.fullName || '', phone: l.phone || '',
              email: l.email || '', lineId: l.lineId || '', note: l.note || '' })
  }

  async function removeLandlord(l) {
    const who = l.fullName || `เจ้าของห้อง #${l.id}`
    if (!window.confirm(`ลบบัญชีเจ้าของห้อง “${who}” ?\n\nกู้คืนไม่ได้`)) return
    setDeletingId(l.id); setError('')
    try {
      await api.deleteLandlord(l.id)
      await refetch()
    } catch (err) {
      // 409 = still owns rooms; show the server's Thai message.
      setError(err instanceof ApiError ? err.message : 'ลบไม่สำเร็จ')
    } finally { setDeletingId(null) }
  }

  const [linkingId, setLinkingId] = useState(null)
  const [claimLink, setClaimLink] = useState(null)  // { url, expiresAt, name, relink }
  const [copied, setCopied] = useState(false)

  async function generateClaimLink(l, relink = false) {
    setLinkingId(l.id); setError('')
    try {
      const res = await api.createLandlordClaimLink(l.id, relink)
      setClaimLink({ ...res, name: l.fullName || `เจ้าของห้อง #${l.id}`, relink })
      setCopied(false)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'สร้างลิงก์ไม่สำเร็จ')
    } finally { setLinkingId(null) }
  }

  function copyLink() {
    if (!claimLink?.url) return
    navigator.clipboard?.writeText(claimLink.url).then(() => setCopied(true)).catch(() => {})
  }

  async function save() {
    if (!form) return
    setSaving(true); setError('')
    // email is `.email()` on the server, so an empty string would fail validation —
    // send null to clear/omit instead of ''.
    const payload = {
      fullName: form.fullName.trim(),
      phone:    form.phone.trim(),
      email:    form.email.trim()  || null,
      lineId:   form.lineId.trim() || null,
      note:     form.note.trim()   || null,
    }
    try {
      if (form.mode === 'create') await api.createLandlord(payload)
      else                        await api.updateLandlord(form.id, payload)
      setForm(null)
      await refetch()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'บันทึกไม่สำเร็จ')
    } finally { setSaving(false) }
  }

  const canSave = form && form.fullName.trim().length >= 1 && form.phone.trim().length >= 8

  return (
    <>
      <div className="flex justify-end mb-4">
        <button type="button" onClick={openCreate} className="btn btn-primary btn-sm">
          <Plus size={16} /> เพิ่มเจ้าของห้อง
        </button>
      </div>

      {error && !form && (
        <div className="mb-4 text-ember-700 text-sm bg-ember-50 border border-ember-200 rounded-lg px-3 py-2">{error}</div>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-navy-50/60 border-b border-line text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-5 py-3.5 font-semibold">ชื่อ</th>
                <th className="px-5 py-3.5 font-semibold">เบอร์โทร</th>
                <th className="px-5 py-3.5 font-semibold">Line</th>
                <th className="px-5 py-3.5 font-semibold">ห้อง</th>
                <th className="px-5 py-3.5 font-semibold">สถานะเชื่อม</th>
                <th className="px-5 py-3.5 font-semibold w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {loading && (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-muted text-sm">กำลังโหลด…</td></tr>
              )}
              {!loading && visible.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-muted">
                    <Home size={32} className="mx-auto mb-2 text-navy-200" />
                    <div className="text-sm">
                      {list.length === 0 ? 'ยังไม่มีเจ้าของห้องในระบบ' : 'ไม่พบเจ้าของห้องที่ตรงกับการค้นหา'}
                    </div>
                  </td>
                </tr>
              )}
              {visible.map((l) => (
                <tr key={l.id} className="hover:bg-cream-50/40">
                  <td className="px-5 py-4">
                    <div className="text-sm font-medium text-navy-700">
                      {l.fullName || <span className="text-muted">ไม่ระบุชื่อ</span>}
                    </div>
                    {l.companyName && <div className="text-xs text-muted">{l.companyName}</div>}
                  </td>
                  <td className="px-5 py-4">
                    {l.phone ? (
                      <a href={`tel:${l.phone}`} className="inline-flex items-center gap-1.5 text-sm text-navy-600 hover:text-navy-800">
                        <Phone size={13} /> {l.phone}
                      </a>
                    ) : <span className="text-xs text-muted">—</span>}
                  </td>
                  <td className="px-5 py-4"><LineBadge lineId={l.lineId} /></td>
                  <td className="px-5 py-4 text-sm text-navy-700">
                    {l.roomCount ?? 0}
                    {(l.availableRoomCount ?? 0) > 0 && (
                      <span className="text-xs text-emerald-600"> ({l.availableRoomCount} ว่าง)</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {l.lineId ? (
                      <span className="inline-block px-2 py-0.5 text-xs rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">เชื่อมแล้ว</span>
                    ) : (
                      <span className="inline-block px-2 py-0.5 text-xs rounded-full border bg-amber-50 text-amber-700 border-amber-200">ยังไม่เชื่อม</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <button onClick={() => generateClaimLink(l, !!l.lineId)} disabled={linkingId === l.id}
                        className="inline-flex items-center gap-1 text-xs font-medium text-[#06C755] hover:text-[#05a648] transition-colors disabled:opacity-50"
                        title={l.lineId ? 'ออกลิงก์เชื่อม LINE ใหม่ (เปลี่ยนบัญชี)' : 'สร้างลิงก์ให้เจ้าของห้องเชื่อม LINE'}>
                        <LineChat size={12} /> {linkingId === l.id ? 'กำลังสร้าง…' : (l.lineId ? 'ออกลิงก์ใหม่' : 'ลิงก์เชื่อม')}
                      </button>
                      <button onClick={() => openEdit(l)}
                        className="inline-flex items-center gap-1 text-xs text-muted hover:text-navy-700 transition-colors">
                        <Pencil size={12} /> แก้ไข
                      </button>
                      <button onClick={() => removeLandlord(l)} disabled={deletingId === l.id}
                        className="inline-flex items-center gap-1 text-xs text-muted hover:text-ember-600 transition-colors disabled:opacity-50"
                        title="ลบบัญชีเจ้าของห้อง">
                        <Trash size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {form && (
        <Modal title={form.mode === 'create' ? 'เพิ่มเจ้าของห้อง' : 'แก้ไขเจ้าของห้อง'} onClose={() => setForm(null)}>
          <div className="space-y-3">
            <Field label="ชื่อเจ้าของห้อง *">
              <input className="input" value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="เช่น คุณสมชาย" />
            </Field>
            <Field label="เบอร์โทร *">
              <input className="input" inputMode="tel" value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="เช่น 081-234-5678" />
            </Field>
            <Field label="อีเมล">
              <input className="input" inputMode="email" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="ไม่บังคับ" />
            </Field>
            <Field label="Line ID">
              <input className="input" value={form.lineId}
                onChange={(e) => setForm({ ...form, lineId: e.target.value })} placeholder="ปกติเว้นว่าง — ระบบผูกกับ LINE ภายหลัง" />
            </Field>
            <Field label="โน้ต">
              <textarea className="input resize-none" rows={2} value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="ไม่บังคับ" />
            </Field>
          </div>
          {error && <div className="mt-3 text-ember-700 text-sm">{error}</div>}
          <button type="button" onClick={save} disabled={saving || !canSave}
            className="btn btn-primary w-full mt-5 disabled:opacity-60">
            {saving ? 'กำลังบันทึก…' : (form.mode === 'create' ? 'เพิ่มเจ้าของห้อง' : 'บันทึก')} {saving ? '' : <Check size={16} />}
          </button>
        </Modal>
      )}

      {claimLink && (
        <Modal title="ลิงก์เชื่อมบัญชี LINE" onClose={() => setClaimLink(null)}>
          <p className="text-sm text-muted mb-3">
            ส่งลิงก์นี้ให้ <b className="text-navy-700">{claimLink.name}</b> — เมื่อกดและล็อกอิน LINE
            บัญชีจะเชื่อมกับข้อมูลนี้ทันที {claimLink.relink && '(ลิงก์ใหม่นี้จะเปลี่ยนบัญชี LINE ที่เชื่อมไว้เดิม)'}
          </p>
          <div className="flex items-stretch gap-2">
            <input readOnly value={claimLink.url} className="input flex-1 text-xs font-mono"
              onFocus={(e) => e.target.select()} />
            <button type="button" onClick={copyLink} className="btn btn-primary btn-sm whitespace-nowrap">
              {copied ? <>คัดลอกแล้ว <Check size={14} /></> : 'คัดลอก'}
            </button>
          </div>
          <div className="mt-3 text-xs text-muted">
            ⏱ ลิงก์หมดอายุ {claimLink.expiresAt ? new Date(claimLink.expiresAt).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' }) : '—'} · ใช้ได้ครั้งเดียว · ระบบแสดงลิงก์นี้ครั้งเดียว
          </div>
        </Modal>
      )}
    </>
  )
}

// ─────────────────────────────── Shared UI ──────────────────────────────────

function Field({ label, children }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  )
}

function Modal({ title, onClose, children }) {
  return (
    <>
      <div className="fixed inset-0 bg-navy-900/30 z-40" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white rounded-2xl shadow-2xl z-50 p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-navy-700 text-lg">{title}</h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm" aria-label="ปิด"><X size={18} /></button>
        </div>
        {children}
      </div>
    </>
  )
}
