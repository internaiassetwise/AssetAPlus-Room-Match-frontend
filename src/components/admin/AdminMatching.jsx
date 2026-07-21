// src/components/admin/AdminMatching.jsx — Manual tenant ↔ room matching panel.
//
// Three-zone layout:
//   1. Existing matches table (status + inline update)
//   2. Create-match form: pick a tenant + pick a room → "สร้างการจับคู่"
//   3. Browse: tenant list (left) + room list (right) side by side
//
// No auto-scoring / suggestion logic — the admin decides every match.

import { useState, useMemo } from 'react'
import { useApi } from '../../hooks/useApi.js'
import { api, ApiError } from '../../api/client.js'
import { Users, Home, Sparkles, Check, X, ArrowRight } from '../icons.jsx'

const MATCH_STATUS = [
  { value: 'suggested',       label: 'แนะนำ' },
  { value: 'contacted',       label: 'ติดต่อแล้ว' },
  { value: 'viewing',         label: 'นัดชม' },
  { value: 'contract_signed', label: 'เซ็นสัญญา' },
  { value: 'rejected',        label: 'ไม่สนใจ' },
]
const STATUS_BADGE = {
  suggested:       'bg-navy-50 text-navy-700 border-navy-200',
  contacted:       'bg-amber-50 text-amber-700 border-amber-200',
  viewing:         'bg-violet-50 text-violet-700 border-violet-200',
  contract_signed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected:        'bg-gray-50 text-muted border-gray-200',
}

export default function AdminMatching() {
  const { data: tenants, loading: loadingTenants } = useApi(() => api.listTenants(), [])
  const { data: rooms,   loading: loadingRooms }   = useApi(() => api.listRooms({ limit: 200 }), [])
  const { data: matches, loading: loadingMatches, refetch: refetchMatches } = useApi(
    () => api.listMatches({ limit: 100 }), [],
  )

  const [selectedTenant, setSelectedTenant] = useState('')
  const [selectedRoom, setSelectedRoom]     = useState('')
  const [note, setNote]                     = useState('')
  const [creating, setCreating]             = useState(false)
  const [error, setError]                   = useState('')

  const tenantList = tenants || []
  const roomList   = rooms || []
  const matchList  = matches || []

  // Quick lookup maps for the matches table
  const tenantMap = useMemo(() => Object.fromEntries(tenantList.map((t) => [t.id, t])), [tenantList])
  const roomMap   = useMemo(() => Object.fromEntries(roomList.map((r) => [r.id, r])), [roomList])

  // Rooms not yet matched to the selected tenant (for the room dropdown)
  const availableRooms = useMemo(() => {
    if (!selectedTenant) return roomList
    const matchedRoomIds = new Set(
      matchList.filter((m) => m.tenantId === Number(selectedTenant)).map((m) => m.roomId),
    )
    return roomList.filter((r) => !matchedRoomIds.has(r.id))
  }, [roomList, matchList, selectedTenant])

  async function createMatch() {
    if (!selectedTenant || !selectedRoom) return
    setCreating(true)
    setError('')
    try {
      await api.createMatch({
        tenantId: Number(selectedTenant),
        roomId:   Number(selectedRoom),
        status:   'suggested',
        agentNote: note.trim() || null,
      })
      setSelectedRoom('')
      setNote('')
      await refetchMatches()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'สร้างการจับคู่ไม่สำเร็จ')
    } finally {
      setCreating(false)
    }
  }

  async function updateMatchStatus(matchId, status) {
    try {
      await api.updateMatch(matchId, { status })
      await refetchMatches()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'อัปเดตสถานะไม่สำเร็จ')
    }
  }

  return (
    <section>
      <div className="mb-7">
        <span className="eyebrow-navy">
          <Sparkles size={14} /> การจับคู่
        </span>
        <h1 className="mt-3 font-bold text-navy-700 text-3xl sm:text-4xl tracking-tight">
          จับคู่<span className="text-ember-600"> ผู้เช่า × ห้อง</span>
        </h1>
        <p className="mt-2 text-muted max-w-2xl">
          เลือกผู้เช่าและห้องที่ตรงกัน แล้วกดสร้างการจับคู่ — แอดมินเป็นคนตัดสินใจทุกคู่
        </p>
      </div>

      {error && (
        <div className="mb-4 text-ember-700 text-sm bg-ember-50 border border-ember-200 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {/* ── Create Match ── */}
      <div className="card p-6 mb-8">
        <h2 className="font-semibold text-navy-700 text-base mb-4">สร้างการจับคู่ใหม่</h2>
        <div className="grid sm:grid-cols-[1fr_1fr_auto] gap-4 items-end">
          <div>
            <label className="label">ผู้เช่า</label>
            <select className="input" value={selectedTenant} onChange={(e) => { setSelectedTenant(e.target.value); setSelectedRoom('') }}>
              <option value="">— เลือกผู้เช่า —</option>
              {tenantList.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.full_name || `ผู้เช่า #${t.id}`}{t.phone ? ` · ${t.phone}` : ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">ห้อง</label>
            <select className="input" value={selectedRoom} onChange={(e) => setSelectedRoom(e.target.value)} disabled={!selectedTenant}>
              <option value="">— เลือกห้อง —</option>
              {availableRooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title} · ฿{Number(r.price || r.monthlyRent || 0).toLocaleString()} · {r.beds ?? r.bedrooms} นอน
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={createMatch}
            disabled={creating || !selectedTenant || !selectedRoom}
            className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {creating ? 'กำลังสร้าง…' : 'สร้างการจับคู่'} <ArrowRight size={16} />
          </button>
        </div>
        <input
          className="input mt-3"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="หมายเหตุ (ไม่จำเป็น) เช่น ลูกค้าสนใจทำเลนี้โดยเฉพาะ"
        />
      </div>

      {/* ── Existing Matches ── */}
      <div className="card overflow-hidden mb-8">
        <div className="px-5 py-4 border-b border-line">
          <h2 className="font-semibold text-navy-700 text-base">การจับคู่ทั้งหมด ({matchList.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-navy-50/60 border-b border-line text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-5 py-3 font-semibold">ผู้เช่า</th>
                <th className="px-5 py-3 font-semibold">ห้อง</th>
                <th className="px-5 py-3 font-semibold">สถานะ</th>
                <th className="px-5 py-3 font-semibold">หมายเหตุ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {loadingMatches && (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-muted text-sm">กำลังโหลด…</td></tr>
              )}
              {!loadingMatches && matchList.length === 0 && (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-muted text-sm">ยังไม่มีการจับคู่</td></tr>
              )}
              {matchList.map((m) => (
                <tr key={m.id} className="hover:bg-cream-50/40">
                  <td className="px-5 py-4 text-sm">
                    <div className="font-medium text-navy-700">
                      {m.tenantName || tenantMap[m.tenantId]?.full_name || `#${m.tenantId}`}
                    </div>
                    {m.tenantPhone && <div className="text-xs text-muted">{m.tenantPhone}</div>}
                  </td>
                  <td className="px-5 py-4 text-sm">
                    <div className="font-medium text-navy-700">
                      {m.roomTitle || roomMap[m.roomId]?.title || `#${m.roomId}`}
                    </div>
                    {m.roomRent && <div className="text-xs text-muted">฿{Number(m.roomRent).toLocaleString()}/เดือน</div>}
                  </td>
                  <td className="px-5 py-4">
                    <select
                      value={m.status}
                      onChange={(e) => updateMatchStatus(m.id, e.target.value)}
                      className={`text-xs font-semibold rounded-full border px-2.5 py-1 cursor-pointer ${STATUS_BADGE[m.status] || ''}`}
                      style={{ appearance: 'none', '-webkit-appearance': 'none' }}
                    >
                      {MATCH_STATUS.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-4 text-xs text-muted max-w-xs">
                    {m.agentNote || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Browse: Tenants + Rooms ── */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Tenant list */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-line flex items-center gap-2">
            <Users size={18} className="text-navy-600" />
            <h2 className="font-semibold text-navy-700 text-base">ผู้เช่า ({tenantList.length})</h2>
          </div>
          <div className="max-h-96 overflow-y-auto divide-y divide-line">
            {loadingTenants && <div className="px-5 py-8 text-center text-muted text-sm">กำลังโหลด…</div>}
            {!loadingTenants && tenantList.length === 0 && (
              <div className="px-5 py-8 text-center text-muted text-sm">ยังไม่มีผู้เช่าในระบบ</div>
            )}
            {tenantList.map((t) => (
              <div
                key={t.id}
                className={`px-5 py-3.5 cursor-pointer transition-colors ${selectedTenant === String(t.id) ? 'bg-navy-50' : 'hover:bg-cream-50/40'}`}
                onClick={() => { setSelectedTenant(String(t.id)); setSelectedRoom('') }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-navy-700 truncate">
                      {t.full_name || `ผู้เช่า #${t.id}`}
                    </div>
                    <div className="text-xs text-muted">
                      {[t.phone, t.email].filter(Boolean).join(' · ') || 'ไม่มีข้อมูลติดต่อ'}
                    </div>
                  </div>
                  {selectedTenant === String(t.id) && <Check size={16} className="text-navy-600 shrink-0" />}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Room list */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-line flex items-center gap-2">
            <Home size={18} className="text-navy-600" />
            <h2 className="font-semibold text-navy-700 text-base">ห้องว่าง ({availableRooms.length})</h2>
          </div>
          <div className="max-h-96 overflow-y-auto divide-y divide-line">
            {loadingRooms && <div className="px-5 py-8 text-center text-muted text-sm">กำลังโหลด…</div>}
            {!loadingRooms && availableRooms.length === 0 && (
              <div className="px-5 py-8 text-center text-muted text-sm">
                {selectedTenant ? 'ไม่มีห้องว่างเหลือ (จับคู่ครบแล้ว)' : 'ยังไม่มีห้องในระบบ'}
              </div>
            )}
            {availableRooms.map((r) => (
              <div
                key={r.id}
                className={`px-5 py-3.5 cursor-pointer transition-colors ${selectedRoom === String(r.id) ? 'bg-emerald-50' : 'hover:bg-cream-50/40'}`}
                onClick={() => setSelectedRoom(String(r.id))}
                style={{ opacity: selectedTenant ? 1 : 0.5 }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-navy-700 truncate">{r.title}</div>
                    <div className="text-xs text-muted">
                      ฿{Number(r.price || r.monthlyRent || 0).toLocaleString()} · {r.beds ?? r.bedrooms} นอน · {r.zone || r.zoneSlug || '—'}
                    </div>
                  </div>
                  {selectedRoom === String(r.id) && <Check size={16} className="text-emerald-600 shrink-0" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
