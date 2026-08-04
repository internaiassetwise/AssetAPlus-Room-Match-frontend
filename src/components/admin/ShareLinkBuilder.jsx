// src/components/admin/ShareLinkBuilder.jsx — build a public link to send a customer.
//
// Admins send customers shortlists ("here are the 3 in ศาลายา under 15k"). Before
// this, that meant browsing the public site, applying filters, and copying the
// address bar — awkward on a phone, which is where admins actually are.
//
// The link is always a PUBLIC url. Copying the admin one would be useless to a
// customer: it needs a login, and it shows the internal room numbers.

import { useMemo, useState } from 'react'
import { useApi } from '../../hooks/useApi.js'
import { api } from '../../api/client.js'
import { projectsForZone } from '../../data/projects.js'
import { Check, X } from '../icons.jsx'

// Mirrors the admin room form's list. Customers shop by room type, not by a
// bedroom count — "1 BEDROOM PLUS" and "1 BEDROOM" are both one bedroom but a
// different product, and the count could not tell them apart.
const ROOM_TYPES = [
  'STUDIO',
  '1 BEDROOM',
  '1 BEDROOM EXCLUSIVE',
  '1 BEDROOM EXTRA',
  '1 BEDROOM PLUS',
]

export default function ShareLinkBuilder({ rooms }) {
  const { data: zones } = useApi(() => api.listZones(), [])
  const [zone, setZone]       = useState('')
  const [project, setProject] = useState('')
  const [min, setMin]         = useState('')
  const [max, setMax]         = useState('')
  const [types, setTypes] = useState([])   // several types can share one link
  const [copied, setCopied]   = useState(false)

  const all = Array.isArray(rooms) ? rooms : []

  // Projects follow the selected zone, from the same curated list the LIFF and
  // admin room forms use — listing every project regardless of zone let admin
  // build a link for a combination that can't exist.
  const projectOptions = useMemo(() => {
    const curated = zone ? projectsForZone(zone) : []
    // Include anything the rooms actually carry for this zone, so a project
    // added to the data but not yet to the curated list is still selectable.
    const fromRooms = all
      .filter((r) => !zone || r.zone === zone)
      .map((r) => String(r.projectName || '').trim())
      .filter(Boolean)
    return [...new Set([...curated, ...fromRooms])].sort((a, b) => a.localeCompare(b, 'th'))
  }, [all, zone])

  const url = useMemo(() => {
    const q = new URLSearchParams()
    if (zone)    q.set('zone', zone)
    if (project) q.set('project', project)
    if (min)     q.set('min', min)
    if (max)     q.set('max', max)
    if (types.length) q.set('type', types.join(','))
    const s = q.toString()
    return `${window.location.origin}/${s ? `?${s}` : ''}`
  }, [zone, project, min, max, types])

  // Live count so nobody sends a link that opens on an empty page. Mirrors the
  // server's filters against the already-loaded list — available rooms only,
  // because that is all the public page shows.
  const matchCount = useMemo(() => {
    const p = project.toLowerCase()
    return all.filter((r) => {
      if (r.status !== 'available') return false
      if (zone && r.zone !== zone) return false
      if (p && !`${r.projectName || ''} ${r.title || ''}`.toLowerCase().includes(p)) return false
      if (min && Number(r.price) < Number(min)) return false
      if (max && Number(r.price) > Number(max)) return false
      if (types.length && !types.includes(String(r.roomType || ''))) return false
      return true
    }).length
  }, [all, zone, project, min, max, types])

  const reset = () => { setZone(''); setProject(''); setMin(''); setMax(''); setTypes([]) }
  const dirty = Boolean(zone || project || min || max || types.length)

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard needs a secure context and permission; give the admin
      // something selectable rather than a button that silently does nothing.
      window.prompt('คัดลอกลิงก์นี้ส่งให้ลูกค้า', url)
    }
  }

  const field = 'input w-full text-base'   // 16px: anything smaller makes iOS zoom on focus

  return (
    <details className="card mb-5 overflow-hidden group">
      <summary className="px-4 sm:px-5 py-3.5 cursor-pointer select-none flex items-center justify-between gap-3 list-none">
        <span className="font-bold text-navy-700 text-sm sm:text-base">🔗 สร้างลิงก์ส่งให้ลูกค้า</span>
        <span className="text-xs text-muted group-open:hidden">เลือกเงื่อนไข แล้วคัดลอกลิงก์</span>
        <span className="text-xs text-muted hidden group-open:inline">ปิด</span>
      </summary>

      <div className="px-4 sm:px-5 pb-5 pt-1 border-t border-line space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="block">
            <span className="label">โซน / ทำเล</span>
            <select className={field} value={zone}
              onChange={(e) => { setZone(e.target.value); setProject('') }}>
              <option value="">ทุกโซน / ทำเล</option>
              {(zones ?? []).map((z) => <option key={z.id} value={z.name}>{z.name}</option>)}
            </select>
          </label>

          <label className="block">
            <span className="label">โครงการ</span>
            <select className={field} value={project} onChange={(e) => setProject(e.target.value)}>
              <option value="">ทุกโครงการ</option>
              {projectOptions.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </label>

          <label className="block">
            <span className="label">ค่าเช่าต่ำสุด (บาท)</span>
            <input type="number" inputMode="numeric" className={field} value={min}
              onChange={(e) => setMin(e.target.value)} placeholder="เช่น 8000" min="0" />
          </label>

          <label className="block">
            <span className="label">ค่าเช่าสูงสุด (บาท)</span>
            <input type="number" inputMode="numeric" className={field} value={max}
              onChange={(e) => setMax(e.target.value)} placeholder="เช่น 15000" min="0" />
          </label>

          <div className="sm:col-span-2">
            {/* Checkboxes, not a multi-select: a native multi-select needs
                cmd-click to add a second value, which does not exist on a phone. */}
            <span className="label">ประเภทห้อง</span>
            <div className="mt-1 flex flex-wrap gap-2">
              {ROOM_TYPES.map((t) => {
                const on = types.includes(t)
                return (
                  <button
                    key={t}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setTypes((ts) => on ? ts.filter((x) => x !== t) : [...ts, t])}
                    className={`min-h-11 px-3 rounded-lg text-sm font-medium border transition-colors ${
                      on ? 'bg-navy-700 text-white border-navy-700' : 'bg-white text-navy-700 border-line hover:bg-navy-50'
                    }`}
                  >
                    {t}
                  </button>
                )
              })}
            </div>
            <div className="mt-1 text-xs text-muted">
              {types.length === 0 ? 'ไม่เลือก = ทุกประเภทห้อง' : `เลือกไว้ ${types.length} ประเภท`}
            </div>
          </div>
        </div>

        <div className={`rounded-lg px-3 py-2 text-sm ${
          matchCount === 0
            ? 'bg-ember-50 border border-ember-200 text-ember-700'
            : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
        }`}>
          {matchCount === 0
            ? 'ไม่มีห้องที่ตรงเงื่อนไขนี้ — ลูกค้าจะเห็นหน้าว่าง ลองผ่อนเงื่อนไขลง'
            : <>ลิงก์นี้ลูกค้าจะเห็น <b>{matchCount}</b> ห้อง</>}
        </div>

        <div>
          <span className="label">ลิงก์</span>
          <input readOnly value={url} onFocus={(e) => e.target.select()}
            aria-label="ลิงก์สำหรับส่งให้ลูกค้า"
            className="input w-full text-xs font-mono bg-cream-50" />
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={copy} disabled={matchCount === 0}
            className="btn btn-primary flex-1 min-w-[9rem]">
            {copied ? <>คัดลอกแล้ว <Check size={16} /></> : 'คัดลอกลิงก์'}
          </button>
          <a href={url} target="_blank" rel="noreferrer" className="btn btn-outline flex-1 min-w-[9rem]">
            เปิดดูก่อนส่ง
          </a>
          {dirty && (
            <button type="button" onClick={reset} className="btn btn-ghost btn-sm">
              <X size={14} /> ล้าง
            </button>
          )}
        </div>
      </div>
    </details>
  )
}
