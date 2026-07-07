// src/components/admin/AdminLayout.jsx — Sidebar shell for /admin/*.
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom'
import { Key, Plus, LogOut, ChevronRight } from '../icons.jsx'
import { useAuth } from '../../contexts/AuthContext.jsx'

export default function AdminLayout() {
  const { admin, logout } = useAuth()
  const navigate = useNavigate()

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
          <Link to="/admin" className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-lg bg-navy-600 text-white grid place-items-center">
              <Key size={18} />
            </span>
            <div className="leading-none">
              <div className="font-bold text-navy-700 text-sm">Asset A Plus · Admin</div>
              <div className="text-[10px] font-semibold text-muted tracking-wider mt-1">ROOM MATCH</div>
            </div>
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
          </nav>
        </aside>

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  )
}