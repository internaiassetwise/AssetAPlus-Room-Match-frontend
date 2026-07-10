// src/components/admin/AdminLayout.jsx — Sidebar shell for /admin/*.
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom'
import { Plus, LogOut, ChevronRight, Bot, Inbox } from '../icons.jsx'
import Logo from '../Logo.jsx'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { useApi } from '../../hooks/useApi.js'
import { api } from '../../api/client.js'

export default function AdminLayout() {
  const { admin, logout } = useAuth()
  const navigate = useNavigate()
  // Live count of listings awaiting approval (badge on the sidebar link).
  const { data: pending } = useApi(() => api.listPendingListings(), [])
  const pendingCount = Array.isArray(pending) ? pending.length : 0

  async function onLogout() {
    await logout()
    navigate('/admin/login', { replace: true })
  }

  const navItem = ({ isActive }) =>
    `flex items-center justify-between px-4 py-3 rounded-lg text-[15px] font-medium transition-colors ${
      isActive
        ? 'bg-navy-50 text-navy-700'
        : 'text-navy-700 hover:bg-navy-50'
    }`

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link to="/admin" className="flex items-center gap-2.5" aria-label="RoomMatch Admin">
            <Logo className="h-9 w-28" />
            <span className="text-[11px] font-semibold text-ember-600 tracking-wider">ADMIN</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link to="/" className="btn btn-ghost btn-sm hidden sm:inline-flex">ดูหน้าเว็บ</Link>
            <span className="hidden md:inline text-sm text-muted px-2">
              {admin?.username}
            </span>
            <button onClick={onLogout} className="btn btn-outline btn-sm">
              <LogOut size={16} /> ออกจากระบบ
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar + content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid lg:grid-cols-[220px_1fr] gap-6 lg:gap-10">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <nav className="card p-3 space-y-1">
            <div className="px-4 pt-2 pb-3 text-[10px] font-bold uppercase tracking-widest text-muted">
              ห้องเช่า
            </div>
            <NavLink to="/admin" end className={navItem}>
              ห้องทั้งหมด
              <ChevronRight size={16} className="text-muted" />
            </NavLink>
            <NavLink to="/admin/rooms/new" className={navItem}>
              <span className="inline-flex items-center gap-2">
                <Plus size={16} /> เพิ่มห้องใหม่
              </span>
              <ChevronRight size={16} className="text-muted" />
            </NavLink>
            <NavLink to="/admin/pending-listings" className={navItem}>
              <span className="inline-flex items-center gap-2">
                <span aria-hidden>⏳</span> รออนุมัติ
                {pendingCount > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full bg-ember-500 text-white text-[11px] font-bold">
                    {pendingCount}
                  </span>
                )}
              </span>
              <ChevronRight size={16} className="text-muted" />
            </NavLink>
            <NavLink to="/admin/viewings" className={navItem}>
              <span className="inline-flex items-center gap-2">
                <span aria-hidden>📅</span> นัดชมรอยืนยัน
              </span>
              <ChevronRight size={16} className="text-muted" />
            </NavLink>
            <div className="px-4 pt-5 pb-3 text-[10px] font-bold uppercase tracking-widest text-muted">
              แชทบอท
            </div>
            <NavLink to="/admin/inbox" className={navItem}>
              <span className="inline-flex items-center gap-2">
                <Inbox size={16} /> Inbox ข้อความจากบอท
              </span>
              <ChevronRight size={16} className="text-muted" />
            </NavLink>
            <NavLink to="/admin/faqs" className={navItem}>
              <span className="inline-flex items-center gap-2">
                <Bot size={16} /> FAQ / ความรู้บอท
              </span>
              <ChevronRight size={16} className="text-muted" />
            </NavLink>
            <NavLink to="/admin/faqs/new" className={navItem}>
              <span className="inline-flex items-center gap-2">
                <Plus size={16} /> เพิ่ม FAQ
              </span>
              <ChevronRight size={16} className="text-muted" />
            </NavLink>
          </nav>
        </aside>

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
