// src/components/admin/AdminLayout.jsx — Shell for /admin/*.
//
// Two layouts from one nav definition:
//   • lg and up — the sidebar card, unchanged.
//   • below lg  — a horizontally scrollable strip of chips pinned under the
//     header. The vertical sidebar was ~700px tall on a phone, so the actual
//     page content began a full screen below the fold and admins scrolled past
//     ten links to reach anything.
//
// Both grid children carry min-w-0. Grid items default to min-width:auto, so a
// child wider than the screen (any of the admin tables) stretches its track and
// drags the whole layout with it — that is why the admin pages were exactly
// twice the viewport wide on a phone, sidebar included.

import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom'
import { Plus, LogOut, ChevronRight, Bot, Inbox, Chart, Users, Home } from '../icons.jsx'
import Logo from '../Logo.jsx'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { useApi } from '../../hooks/useApi.js'
import { api } from '../../api/client.js'

/** Nav model — rendered as a sidebar on desktop and as chips on mobile. */
const SECTIONS = [
  {
    title: 'ภาพรวม',
    items: [
      { to: '/admin', end: true, label: 'ภาพรวม', short: 'ภาพรวม', Icon: Chart },
    ],
  },
  {
    title: 'ห้องเช่า',
    items: [
      { to: '/admin/rooms', label: 'ห้องทั้งหมด', short: 'ห้องทั้งหมด', Icon: Home },
      { to: '/admin/rooms/new', label: 'เพิ่มห้องใหม่', short: 'เพิ่มห้อง', Icon: Plus },
      { to: '/admin/pending-listings', label: 'รออนุมัติ', short: 'รออนุมัติ', emoji: '⏳', badge: 'pending' },
      { to: '/admin/viewings', label: 'นัดชมรอยืนยัน', short: 'นัดชม', emoji: '📅' },
    ],
  },
  {
    title: 'แชทบอท',
    items: [
      { to: '/admin/inbox', label: 'Inbox · ข้อความ', short: 'ข้อความ', Icon: Inbox },
      { to: '/admin/contacts', label: 'รายชื่อลูกค้า', short: 'รายชื่อ', Icon: Users },
      { to: '/admin/faqs', label: 'FAQ / ความรู้บอท', short: 'FAQ', Icon: Bot },
      { to: '/admin/faqs/new', label: 'เพิ่ม FAQ', short: 'เพิ่ม FAQ', Icon: Plus },
    ],
  },
  {
    title: 'ลูกค้า',
    items: [
      { to: '/admin/matching', label: 'จับคู่ ผู้เช่า × ห้อง', short: 'จับคู่', Icon: Users },
    ],
  },
]

export default function AdminLayout() {
  const { admin, logout } = useAuth()
  const navigate = useNavigate()
  // Live count of listings awaiting approval (badge on the nav link).
  const { data: pending } = useApi(() => api.listPendingListings(), [])
  const pendingCount = Array.isArray(pending) ? pending.length : 0

  async function onLogout() {
    await logout()
    navigate('/admin/login', { replace: true })
  }

  const badgeFor = (key) => (key === 'pending' && pendingCount > 0 ? pendingCount : 0)

  const Badge = ({ n }) => (
    <span className="ml-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full bg-ember-500 text-white text-[11px] font-bold">
      {n}
    </span>
  )

  // ── Desktop sidebar item ────────────────────────────────────────────────
  const navItem = ({ isActive }) =>
    `flex items-center justify-between px-4 py-3 rounded-lg text-[15px] font-medium transition-colors ${
      isActive ? 'bg-navy-50 text-navy-700' : 'text-navy-700 hover:bg-navy-50'
    }`

  // ── Mobile chip ─────────────────────────────────────────────────────────
  // min-h-11 = 44px, the minimum comfortable touch target.
  const chip = ({ isActive }) =>
    `shrink-0 inline-flex items-center gap-1.5 min-h-11 px-3.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
      isActive ? 'bg-navy-700 text-white' : 'bg-white text-navy-700 border border-line'
    }`

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <Link to="/admin" className="flex items-center gap-2.5 min-w-0" aria-label="RoomMatch Admin">
            <Logo className="h-8 w-24 sm:h-9 sm:w-28 shrink-0" />
            <span className="text-[11px] font-semibold text-ember-600 tracking-wider">ADMIN</span>
          </Link>

          <div className="flex items-center gap-2 shrink-0">
            <Link to="/" className="btn btn-ghost btn-sm hidden sm:inline-flex">ดูหน้าเว็บ</Link>
            <span className="hidden md:inline text-sm text-muted px-2">{admin?.username}</span>
            <button onClick={onLogout} className="btn btn-outline btn-sm" aria-label="ออกจากระบบ">
              <LogOut size={16} /> <span className="hidden xs:inline sm:inline">ออกจากระบบ</span>
            </button>
          </div>
        </div>

        {/* Mobile nav — one horizontal row, always one tap from any screen. */}
        <nav
          aria-label="เมนูแอดมิน"
          className="lg:hidden flex gap-2 overflow-x-auto px-4 pb-3 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {SECTIONS.flatMap((s) => s.items).map(({ to, end, short, Icon, emoji, badge }) => (
            <NavLink key={to} to={to} end={end} className={chip}>
              {Icon ? <Icon size={15} /> : emoji ? <span aria-hidden>{emoji}</span> : null}
              {short}
              {badgeFor(badge) > 0 && <Badge n={badgeFor(badge)} />}
            </NavLink>
          ))}
        </nav>
      </header>

      {/* Sidebar + content. min-w-0 on both tracks — see the header comment. */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-8 grid lg:grid-cols-[220px_minmax(0,1fr)] gap-6 lg:gap-10">
        <aside className="hidden lg:block lg:sticky lg:top-24 lg:self-start min-w-0">
          <nav className="card p-3 space-y-1">
            {SECTIONS.map(({ title, items }) => (
              <div key={title}>
                <div className="px-4 pt-2 pb-3 text-[10px] font-bold uppercase tracking-widest text-muted">
                  {title}
                </div>
                {items.map(({ to, end, label, Icon, emoji, badge }) => (
                  <NavLink key={to} to={to} end={end} className={navItem}>
                    <span className="inline-flex items-center gap-2">
                      {Icon ? <Icon size={16} /> : emoji ? <span aria-hidden>{emoji}</span> : null}
                      {label}
                      {badgeFor(badge) > 0 && <Badge n={badgeFor(badge)} />}
                    </span>
                    <ChevronRight size={16} className="text-muted" />
                  </NavLink>
                ))}
              </div>
            ))}
            {/* Direct browser navigation to the .xlsx endpoint — the admin
                session cookie rides along automatically, so requireAdmin passes. */}
            <a href={api.tenantLeadsXlsxUrl()} className={navItem({ isActive: false })} download>
              <span className="inline-flex items-center gap-2">
                <Chart size={16} /> ดาวน์โหลด Lead (Excel)
              </span>
              <ChevronRight size={16} className="text-muted" />
            </a>
          </nav>
        </aside>

        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
