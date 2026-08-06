// src/components/admin/AdminDashboard.jsx — the first screen after admin login.
//
// Answers "what needs me right now" and "what does the portfolio look like",
// broken down by โครงการ and by ทำเล. Every row is a link into the rooms list
// with that filter already applied, so a number is never a dead end.

import { Link } from 'react-router-dom'
import { useApi } from '../../hooks/useApi.js'
import { api } from '../../api/client.js'
import { Home, Inbox, Users } from '../icons.jsx'
import WatermarkPanel from './WatermarkPanel.jsx'

const baht = (n) => `฿${Number(n || 0).toLocaleString()}`

/** A headline number. `to` makes it a link; `tone` flags the ones needing action. */
function Stat({ label, value, to, tone = 'plain' }) {
  const toneClass = tone === 'action' && Number(value) > 0
    ? 'border-ember-300 bg-ember-50/60'
    : 'border-transparent'
  const body = (
    <>
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-0.5 text-2xl sm:text-3xl font-bold text-navy-700 tabular-nums">{value}</div>
    </>
  )
  return to
    ? <Link to={to} className={`card p-3.5 border-2 ${toneClass} block hover:border-navy-300 transition-colors`}>{body}</Link>
    : <div className={`card p-3.5 border-2 ${toneClass}`}>{body}</div>
}

/**
 * A breakdown table. Scrolls inside its own container rather than letting the
 * page scroll sideways — on a phone the rent and views columns would otherwise
 * push the layout off-screen.
 */
function Breakdown({ title, rows, keyLabel, linkFor }) {
  if (!rows?.length) return null
  return (
    <section className="card overflow-hidden">
      <h2 className="px-4 sm:px-5 py-3 border-b border-line text-sm font-bold text-navy-700">{title}</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-navy-50/60 text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="px-4 sm:px-5 py-2.5 font-semibold">{keyLabel}</th>
              <th className="px-3 py-2.5 font-semibold text-right whitespace-nowrap">ห้อง</th>
              <th className="px-3 py-2.5 font-semibold text-right whitespace-nowrap">ว่าง</th>
              <th className="px-3 py-2.5 font-semibold text-right whitespace-nowrap">ค่าเช่าเฉลี่ย</th>
              <th className="px-4 sm:px-5 py-2.5 font-semibold text-right whitespace-nowrap">เข้าชม</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((r) => {
              const to = linkFor?.(r)
              const name = r.project ?? r.zone
              return (
                <tr key={name} className="hover:bg-cream-50/50">
                  <td className="px-4 sm:px-5 py-3 font-medium text-navy-700">
                    {to ? <Link to={to} className="hover:underline">{name}</Link> : name}
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums">{r.rooms}</td>
                  <td className="px-3 py-3 text-right tabular-nums">
                    {r.available === 0
                      ? <span className="text-muted">0</span>
                      : <span className="text-emerald-700 font-semibold">{r.available}</span>}
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums whitespace-nowrap">{baht(r.avgRent)}</td>
                  <td className="px-4 sm:px-5 py-3 text-right tabular-nums text-muted">{r.views}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default function AdminDashboard() {
  const { data, loading, error, refetch } = useApi(() => api.adminStats(), [])
  const t = data?.totals

  return (
    <section>
      <div className="mb-5 sm:mb-6">
        <span className="eyebrow-navy">แอดมิน</span>
        <h1 className="mt-3 font-bold text-navy-700 text-2xl sm:text-4xl tracking-tight">ภาพรวม</h1>
        <p className="mt-2 text-muted text-sm sm:text-base">
          สรุปห้องเช่าทั้งหมด แยกตามโครงการและทำเล — กดที่ตัวเลขหรือชื่อเพื่อดูรายการห้อง
        </p>
      </div>

      {loading && <div className="card p-8 text-center text-muted text-sm">กำลังโหลด…</div>}

      {error && (
        <div className="card p-4 text-sm text-ember-700 flex flex-wrap items-center gap-3">
          <span>โหลดข้อมูลสรุปไม่สำเร็จ</span>
          <button type="button" onClick={refetch} className="btn btn-outline btn-sm">ลองอีกครั้ง</button>
        </div>
      )}

      {t && (
        <>
          {/* Things waiting on a person come first — that is what the dashboard
              is for. Portfolio numbers are context, not a to-do list. */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mb-3">
            <Stat label="รอแอดมินตอบ"   value={t.inboxOpen}    to="/admin/inbox"            tone="action" />
            <Stat label="ประกาศรออนุมัติ" value={t.roomsPending} to="/admin/pending-listings" tone="action" />
            <Stat label="นัดชม 7 วันนี้"  value={t.viewingsWeek} to="/admin/viewings" />
            <Stat label="ห้องว่าง"        value={t.roomsAvailable} to="/admin/rooms?status=available" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mb-6">
            <Stat label="ห้องทั้งหมด" value={t.roomsTotal}    to="/admin/rooms" />
            <Stat label="จองแล้ว"     value={t.roomsReserved} to="/admin/rooms?status=reserved" />
            <Stat label="ผู้เช่า"      value={t.tenants}       to="/admin/contacts" />
            <Stat label="เจ้าของห้อง"  value={t.landlords}     to="/admin/contacts" />
          </div>

          <div className="space-y-6">
            <Breakdown
              title="แยกตามโครงการ" keyLabel="โครงการ" rows={data.byProject}
              linkFor={(r) => `/admin/rooms?project=${encodeURIComponent(r.project)}`}
            />
            <Breakdown
              title="แยกตามทำเล" keyLabel="ทำเล" rows={data.byZone}
              linkFor={(r) => `/admin/rooms?zone=${encodeURIComponent(r.zone)}`}
            />

            {data.topInterest?.length > 0 && (
              <section className="card overflow-hidden">
                <h2 className="px-4 sm:px-5 py-3 border-b border-line text-sm font-bold text-navy-700">
                  ห้องที่ลูกค้าถามมากที่สุด <span className="font-normal text-muted">(30 วันล่าสุด)</span>
                </h2>
                <ul className="divide-y divide-line">
                  {data.topInterest.map((r) => (
                    <li key={r.roomId} className="px-4 sm:px-5 py-3 flex items-center justify-between gap-3">
                      <Link to={`/admin/rooms/${r.roomId}/edit`} className="min-w-0 text-sm font-medium text-navy-700 hover:underline truncate">
                        {r.title}
                        {r.roomCode && <span className="font-normal text-muted"> · ห้อง {r.roomCode}</span>}
                      </Link>
                      <span className="shrink-0 text-xs text-muted tabular-nums">
                        {r.people} คน · {r.asks} ครั้ง
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <WatermarkPanel />
          </div>
        </>
      )}
    </section>
  )
}
