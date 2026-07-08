// src/pages/Viewings.jsx — Calendar list view (upcoming / past).
//
// Under the middleman flow tenants don't self-book; admin sets the dates and
// tenants are notified. The page is therefore a calendar of confirmed +
// past viewings for both sides.
//
// Same page works for tenants and landlords. The role chips let the user
// switch manually; chips for sides without an active session are disabled.

import { useState } from 'react'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import DevMockBanner from '../components/DevMockBanner.jsx'
import ViewingCard from '../components/ViewingCard.jsx'
import ContactAdminLineCTA from '../components/ContactAdminLineCTA.jsx'
import { useUserAuth }     from '../contexts/UserAuthContext.jsx'
import { useLandlordAuth } from '../contexts/LandlordAuthContext.jsx'
import { useApi } from '../hooks/useApi.js'
import { api } from '../api/client.js'
import { Calendar, Sparkles } from '../components/icons.jsx'

export default function Viewings() {
  const { user: tenantUser }         = useUserAuth()
  const { landlord: landlordUser }   = useLandlordAuth()

  // Default role = the persona you ARE signed in as.
  const defaultRole = landlordUser ? 'landlord' : 'tenant'
  const [role, setRole] = useState(defaultRole)
  const [tab,  setTab]  = useState('upcoming')

  const { data: items, loading, reload } = useApi(
    () => api.listViewings({ role }),
    [role],
  )

  const now = Date.now()
  const groups = split(items || [], tab, now, role)

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
              ? 'นัดหมายที่แอดมินยืนยันให้คุณ'
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

        {/* Tenant side hint: bookings go through Line */}
        {role === 'tenant' && (
          <div className="rounded-xl border border-navy-200 bg-navy-50/40 p-4 mb-5 flex items-start gap-3">
            <Sparkles size={18} className="text-navy-600 mt-0.5 shrink-0" />
            <div className="text-sm text-navy-700 leading-relaxed flex-1">
              <div className="font-semibold">ต้องการนัดชมห้องเพิ่ม?</div>
              <p className="mt-1 text-muted">
                การนัดชมห้องใหม่ต้องติดต่อแอดมินทาง Line แอดมินจะช่วยเลือกวันและเวลาให้
              </p>
              <div className="mt-3">
                <ContactAdminLineCTA intent="view-a-room" variant="bare" showPhone={false} />
              </div>
            </div>
          </div>
        )}

        <div className="card p-2 mb-6 flex items-center gap-1">
          <Tab current={tab} value="upcoming" onClick={setTab}>
            {role === 'tenant' ? 'กำลังจะมาถึง' : 'กำลังจะมาถึง'}
          </Tab>
          {/* Tenants never have pending requests under the new middleman flow —
              admin is the only side that creates them. */}
          {role === 'landlord' && (
            <Tab current={tab} value="pending" onClick={setTab}>
              รอยืนยัน
            </Tab>
          )}
          <Tab current={tab} value="past" onClick={setTab}>
            ที่ผ่านมา
          </Tab>
        </div>

        {loading && <div className="text-muted text-center py-10">กำลังโหลด…</div>}
        {!loading && groups.length === 0 && (
          <div className="card p-10 text-center text-muted">
            <Calendar size={32} className="mx-auto text-navy-300" />
            <p className="mt-3">ไม่มีรายการในหมวดนี้</p>
            {role === 'tenant' && (
              <div className="mt-5">
                <ContactAdminLineCTA intent="view-a-room" variant="bare" showPhone={false} />
              </div>
            )}
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

/**
 * Splits viewings by tab. For tenants the "pending" tab is no longer offered
 * upstream (it's hidden in the UI), but we still defend by treating any
 * status='requested' row on the tenant side as belonging to "upcoming" if the
 * date is in the future.
 */
function split(items, tab, nowMs, role) {
  const toMs = (s) => new Date(s).getTime()
  if (tab === 'upcoming') {
    return items.filter((v) =>
      ['confirmed', 'requested'].includes(v.status) && toMs(v.scheduled_for) >= nowMs
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