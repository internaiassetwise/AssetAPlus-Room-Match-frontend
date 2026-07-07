// src/pages/Viewings.jsx — Calendar list view (upcoming / pending / past).
//
// Same page works for tenants and landlords. The default role is computed
// from active sessions: if a landlord session is active, default to the
// landlord view; otherwise default to the tenant view. The role chips let
// the user switch manually; chips for sides without an active session are
// disabled (would 401 on the API anyway).

import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import DevMockBanner from '../components/DevMockBanner.jsx'
import ViewingCard from '../components/ViewingCard.jsx'
import { useUserAuth }     from '../contexts/UserAuthContext.jsx'
import { useLandlordAuth } from '../contexts/LandlordAuthContext.jsx'
import { useApi } from '../hooks/useApi.js'
import { api } from '../api/client.js'
import { Calendar } from '../components/icons.jsx'

export default function Viewings() {
  const { user: tenantUser }         = useUserAuth()
  const { landlord: landlordUser }   = useLandlordAuth()

  // Default role = the persona you ARE signed in as. The route wrapper
  // RequireUser guarantees at least a tenant session by this point.
  const defaultRole = landlordUser ? 'landlord' : 'tenant'
  const [role, setRole] = useState(defaultRole)
  const [tab,  setTab]  = useState('upcoming')

  const { data: items, loading, reload } = useApi(
    () => api.listViewings({ role }),
    [role],
  )

  const now = Date.now()
  const groups = split(items || [], tab, now)

  return (
    <>
      <DevMockBanner />
      <Navbar />
      <main className="container-page py-10 max-w-4xl">
        <header className="mb-7">
          <span className="eyebrow-navy"><Calendar size={14} /> นัดชมห้อง</span>
          <h1 className="mt-3 text-3xl font-bold text-navy-700">
            ตาราง<span className="text-ember-600"> นัดชมห้อง</span>
          </h1>
          <p className="mt-2 text-muted">
            {role === 'tenant'
              ? 'นัดหมายที่คุณส่งเข้ามา และที่กำลังจะมาถึง'
              : 'คำขอนัดชมห้องที่เข้ามาหาคุณ'}
          </p>
        </header>

        <div className="flex flex-wrap gap-2 mb-5">
          <button
            type="button"
            onClick={() => setRole('tenant')}
            disabled={!tenantUser}
            title={!tenantUser ? 'ต้องเข้าสู่ระบบในฐานะผู้เช่าก่อน' : undefined}
            className={`chip ${role === 'tenant' ? 'chip-active' : ''} ${!tenantUser ? 'opacity-40 cursor-not-allowed' : ''}`}
          >ฝั่งผู้เช่า</button>
          <button
            type="button"
            onClick={() => setRole('landlord')}
            disabled={!landlordUser}
            title={!landlordUser ? 'ต้องเข้าสู่ระบบในฐานะเจ้าของห้องก่อน' : undefined}
            className={`chip ${role === 'landlord' ? 'chip-active' : ''} ${!landlordUser ? 'opacity-40 cursor-not-allowed' : ''}`}
          >ฝั่งเจ้าของ</button>
        </div>

        <div className="card p-2 mb-6 flex items-center gap-1">
          <Tab current={tab} value="upcoming" onClick={setTab}>
            กำลังจะมาถึง
          </Tab>
          <Tab current={tab} value="pending" onClick={setTab}>
            รอยืนยัน
          </Tab>
          <Tab current={tab} value="past" onClick={setTab}>
            ที่ผ่านมา
          </Tab>
        </div>

        {loading && <div className="text-muted text-center py-10">กำลังโหลด…</div>}
        {!loading && groups.length === 0 && (
          <div className="card p-10 text-center text-muted">
            <Calendar size={32} className="mx-auto text-navy-300" />
            <p className="mt-3">ไม่มีรายการในหมวดนี้</p>
          </div>
        )}
        {!loading && groups.length > 0 && (
          <div className="space-y-3">
            {groups.map((v) => (
              <ViewingCard key={v.id} viewing={v} role={role} onUpdate={reload} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}

function Tab({ current, value, onClick, children }) {
  const active = current === value
  return (
    <button type="button" onClick={() => onClick(value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium flex-1 ${active ? 'bg-navy-600 text-white shadow-card' : 'text-muted hover:text-navy-700'}`}>
      {children}
    </button>
  )
}

function split(items, tab, nowMs) {
  const toMs = (s) => new Date(s).getTime()
  if (tab === 'upcoming') {
    return items.filter((v) =>
      v.status === 'confirmed' && toMs(v.scheduled_for) >= nowMs
    ).sort((a, b) => toMs(a.scheduled_for) - toMs(b.scheduled_for))
  }
  if (tab === 'pending') {
    return items.filter((v) => v.status === 'requested')
      .sort((a, b) => toMs(b.scheduled_for) - toMs(a.scheduled_for))
  }
  // past
  return items.filter((v) =>
    v.status === 'completed' || v.status === 'declined' || v.status === 'cancelled' ||
    toMs(v.scheduled_for) < nowMs
  ).sort((a, b) => toMs(b.scheduled_for) - toMs(a.scheduled_for))
}