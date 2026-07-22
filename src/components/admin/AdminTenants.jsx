// src/components/admin/AdminTenants.jsx — Tenant directory + contact management.
//
// Searchable table of all tenants. Admin can edit name + phone inline
// (info they collected via Line chat). This is the canonical place to
// manage tenant contact info — the matching page just consumes it.

import { useState, useMemo } from 'react'
import { useApi } from '../../hooks/useApi.js'
import { api, ApiError } from '../../api/client.js'
import { Search, Users, X, Check, Phone, LineChat, Pencil } from '../icons.jsx'

export default function AdminTenants() {
  const { data: tenants, loading, refetch } = useApi(() => api.listTenants(), [])
  const [filter, setFilter]     = useState('')
  const [editing, setEditing]   = useState(null)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')

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

  async function saveEdit() {
    if (!editing) return
    setSaving(true)
    setError('')
    try {
      await api.updateTenant(editing.id, {
        fullName: editing.fullName.trim() || undefined,
        phone:    editing.phone.trim()    || undefined,
      })
      setEditing(null)
      await refetch()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'บันทึกไม่สำเร็จ')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section>
      <div className="mb-7">
        <span className="eyebrow-navy">ผู้เช่า</span>
        <h1 className="mt-3 font-bold text-navy-700 text-3xl sm:text-4xl tracking-tight">
          รายชื่อ<span className="text-ember-600"> ผู้เช่า</span>
        </h1>
        <p className="mt-2 text-muted max-w-2xl">
          ดูและแก้ไขข้อมูลติดต่อของผู้เช่า — ชื่อและเบอร์โทรที่ได้จากการคุยผ่าน Line
        </p>
      </div>

      {/* Search */}
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

      {error && (
        <div className="mb-4 text-ember-700 text-sm bg-ember-50 border border-ember-200 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {/* Table */}
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
                    ) : (
                      <span className="text-xs text-muted">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {t.line_id ? (
                      <button
                        onClick={() => navigator.clipboard?.writeText(t.line_id).catch(() => {})}
                        className="inline-flex items-center gap-1 text-xs font-medium text-[#06C755] bg-[#06C755]/10 hover:bg-[#06C755]/20 rounded-md px-2 py-0.5 transition-colors"
                        title={`คัดลอก: ${t.line_id}`}
                      >
                        <LineChat size={11} /> {t.line_id.slice(0, 12)}…
                      </button>
                    ) : (
                      <span className="text-xs text-muted">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs text-muted">
                      {t.source === 'line-bot' ? 'เข้าผ่านบอท' : t.source || '—'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => setEditing({ id: t.id, fullName: t.full_name || '', phone: t.phone || '' })}
                      className="inline-flex items-center gap-1 text-xs text-muted hover:text-navy-700 transition-colors"
                    >
                      <Pencil size={12} /> แก้ไข
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit modal */}
      {editing && (
        <>
          <div className="fixed inset-0 bg-navy-900/30 z-40" onClick={() => setEditing(null)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white rounded-2xl shadow-2xl z-50 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-navy-700 text-lg">แก้ไขข้อมูลติดต่อ</h3>
              <button onClick={() => setEditing(null)} className="btn btn-ghost btn-sm" aria-label="ปิด">
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-muted mb-4">
              ข้อมูลที่กรอกจะผูกกับ Line ID ของผู้เช่าคนนี้ (#{editing.id})
            </p>
            <div className="space-y-3">
              <div>
                <label className="label">ชื่อ</label>
                <input
                  className="input"
                  value={editing.fullName}
                  onChange={(e) => setEditing({ ...editing, fullName: e.target.value })}
                  placeholder="เช่น คุณสมชาย"
                />
              </div>
              <div>
                <label className="label">เบอร์โทร</label>
                <input
                  className="input"
                  inputMode="tel"
                  value={editing.phone}
                  onChange={(e) => setEditing({ ...editing, phone: e.target.value })}
                  placeholder="เช่น 081-234-5678"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={saveEdit}
              disabled={saving}
              className="btn btn-primary w-full mt-5 disabled:opacity-60"
            >
              {saving ? 'กำลังบันทึก…' : 'บันทึก'} {saving ? '' : <Check size={16} />}
            </button>
          </div>
        </>
      )}
    </section>
  )
}
