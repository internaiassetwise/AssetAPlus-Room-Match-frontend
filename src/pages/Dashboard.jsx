// src/pages/Dashboard.jsx — Landlord KPI dashboard.
//
// 4 tiles + recent activity feeds. Landlords-only (uses /api/dashboard).

import { useApi } from '../hooks/useApi.js'
import { api } from '../api/client.js'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import DevMockBanner from '../components/DevMockBanner.jsx'
import { Chart, Home, Inbox, Calendar } from '../components/icons.jsx'

export default function Dashboard() {
  const { data, loading, error } = useApi(() => api.getDashboard(), [])

  return (
    <>
      <DevMockBanner />
      <Navbar />
      <main className="container-page py-10">
        <header className="mb-7">
          <span className="eyebrow-navy"><Chart size={14} /> Dashboard</span>
          <h1 className="mt-3 text-3xl font-bold text-navy-700">
            ภาพรวม<span className="text-ember-600"> ห้องของคุณ</span>
          </h1>
          <p className="mt-2 text-muted">ตัวเลขสำคัญ + กิจกรรมล่าสุดจากผู้สนใจ</p>
        </header>

        {loading && <div className="text-muted text-center py-10">กำลังโหลด…</div>}
        {error && <div className="card p-6 text-ember-700">{error.message}</div>}
        {data && (
          <>
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              <KPI icon={Home}     label="ห้องทั้งหมด"   value={data.totalRooms}        accent="navy" />
              <KPI icon={Home}     label="ห้องว่าง"      value={data.availableRooms}    accent="emerald" />
              <KPI icon={Calendar} label="นัดชมที่จะมา" value={data.upcomingViewings}  accent="ember" />
              <KPI icon={Inbox}    label="ข้อความ 7 วัน" value={data.inquiriesThisWeek} accent="navy" />
            </section>

            <section className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-1 card p-6">
                <h3 className="font-semibold text-navy-700 text-base mb-4">อัตราเข้าพัก</h3>
                <OccupancyRing pct={data.occupancyRate} />
                <p className="mt-3 text-muted text-sm text-center">
                  {data.occupancyRate}% ของห้องทั้งหมดมีผู้เช่าแล้ว
                </p>
              </div>
              <div className="card p-6">
                <h3 className="font-semibold text-navy-700 text-base mb-4">ข้อความล่าสุด</h3>
                {data.recentInquiries.length === 0 && (
                  <p className="text-muted text-sm">ยังไม่มีข้อความ</p>
                )}
                <ul className="space-y-3">
                  {data.recentInquiries.map((i) => (
                    <li key={i.id} className="text-sm border-b border-line pb-3 last:border-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-navy-700">{i.tenant_name}</span>
                        <span className="text-xs text-muted">{fmtRel(i.created_at)}</span>
                      </div>
                      <div className="text-muted truncate">{i.room_title}</div>
                      <div className="mt-1 text-navy-700 line-clamp-2">{i.message}</div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="card p-6">
                <h3 className="font-semibold text-navy-700 text-base mb-4">นัดชมล่าสุด</h3>
                {data.recentViewings.length === 0 && (
                  <p className="text-muted text-sm">ยังไม่มีนัดชม</p>
                )}
                <ul className="space-y-3">
                  {data.recentViewings.map((v) => (
                    <li key={v.id} className="text-sm border-b border-line pb-3 last:border-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-navy-700">{v.tenant_name}</span>
                        <span className="text-xs text-muted">{fmtRel(v.scheduled_for)}</span>
                      </div>
                      <div className="text-muted truncate">{v.room_title}</div>
                      <div className="mt-1 text-xs text-navy-700 capitalize">{v.status}</div>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </>
        )}
      </main>
      <Footer />
    </>
  )
}

function KPI({ icon: Icon, label, value, accent }) {
  const tone = accent === 'ember'
    ? 'bg-ember-50 text-ember-700'
    : accent === 'emerald'
      ? 'bg-emerald-50 text-emerald-700'
      : 'bg-navy-50 text-navy-700'
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <span className={`w-10 h-10 rounded-lg grid place-items-center ${tone}`}>
          <Icon size={18} />
        </span>
      </div>
      <div className="mt-4 text-3xl font-bold text-navy-700">{value}</div>
      <div className="text-sm text-muted mt-1">{label}</div>
    </div>
  )
}

function OccupancyRing({ pct }) {
  const r = 56, c = 2 * Math.PI * r
  const offset = c - (Math.min(100, Math.max(0, pct)) / 100) * c
  return (
    <div className="grid place-items-center py-2">
      <svg width="140" height="140" viewBox="0 0 140 140" aria-label={`อัตราเข้าพัก ${pct}%`}>
        <circle cx="70" cy="70" r={r} fill="none" stroke="#EEF2F7" strokeWidth="12" />
        <circle cx="70" cy="70" r={r} fill="none" stroke="#1E3A8A" strokeWidth="12" strokeLinecap="round"
                strokeDasharray={c} strokeDashoffset={offset} transform="rotate(-90 70 70)" />
        <text x="70" y="78" textAnchor="middle" className="text-2xl font-bold fill-navy-700" style={{ fontSize: 28, fontWeight: 700 }}>{pct}%</text>
      </svg>
    </div>
  )
}

function fmtRel(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const diff = (Date.now() - d.getTime()) / 1000
  if (diff < 60) return 'เมื่อกี้'
  if (diff < 3600) return `${Math.floor(diff / 60)} นาทีที่แล้ว`
  if (diff < 86400) return `${Math.floor(diff / 3600)} ชม. ที่แล้ว`
  return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })
}