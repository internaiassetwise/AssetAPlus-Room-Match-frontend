import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Phone, LineChat, Key, Menu, Close, Shield, LogOut, Search, Calendar, Inbox, Home, Chart } from './icons.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useUserAuth }     from '../contexts/UserAuthContext.jsx'
import { useLandlordAuth } from '../contexts/LandlordAuthContext.jsx'
import NavUserMenu from './NavUserMenu.jsx'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const { admin } = useAuth()
  const { user: tenantUser, loading: tenantLoading, logout: tenantLogout } = useUserAuth()
  const { landlord: landlordUser, loading: landlordLoading, logout: landlordLogout } = useLandlordAuth()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Still waiting for /me on either side → render no CTA so we don't flash a
  // wrong button while the session cookie is being verified.
  const authLoading = tenantLoading || landlordLoading
  const anySignedIn = !!(tenantUser || landlordUser)

  const goSwitchPersona = () => {
    setOpen(false)
    navigate('/login')
  }

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-200 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-md border-b border-line shadow-soft'
          : 'bg-white border-b border-transparent'
      }`}
    >
      <nav className="container-page flex items-center justify-between h-20 gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <span className="w-11 h-11 rounded-lg bg-navy-600 text-white grid place-items-center group-hover:bg-navy-700 transition-colors">
            <Key size={22} />
          </span>
          <div className="leading-none whitespace-nowrap">
            <div className="font-bold text-navy-700 text-base tracking-tight">Room Match</div>
            <div className="text-[11px] font-semibold text-ember-600 tracking-[0.18em] mt-1">ASSET A PLUS</div>
          </div>
        </Link>

        {/* Desktop nav — marketing anchors only when not signed in (sign-in
            context switches priorities toward feature links) */}
        <div className="hidden lg:flex items-center gap-1 min-w-0">
          <a className="nav-link" href="/#hero">หน้าแรก</a>
          {!anySignedIn && (
            <>
              <a className="nav-link hidden xl:inline-flex" href="/#how">วิธีการ</a>
              <a className="nav-link" href="/#listings">ห้องว่าง</a>
              <Link className="nav-link inline-flex items-center gap-1.5" to="/search">
                <Search size={14} /> ค้นหา
              </Link>
              <a className="nav-link hidden xl:inline-flex" href="/#landlords">เจ้าของห้อง</a>
              <a className="nav-link hidden xl:inline-flex" href="/#faq">คำถาม</a>
            </>
          )}
          {anySignedIn && (
            <Link className="nav-link inline-flex items-center gap-1.5" to="/search">
              <Search size={14} /> ค้นหา
            </Link>
          )}
          {/* Landlord-only links — appear only when a landlord session exists */}
          {landlordUser && (
            <>
              <Link className="nav-link inline-flex items-center gap-1.5" to="/dashboard">
                <Chart size={14} /> Dashboard
              </Link>
              <Link className="nav-link inline-flex items-center gap-1.5" to="/my-listings">
                <Home size={14} /> ห้องของฉัน
              </Link>
              <Link className="nav-link hidden 2xl:inline-flex items-center gap-1.5" to="/inquiries">
                <Inbox size={14} /> กล่องข้อความ
              </Link>
            </>
          )}
          {anySignedIn && (
            <Link className="nav-link inline-flex items-center gap-1.5" to="/viewings">
              <Calendar size={14} /> นัดชมห้อง
            </Link>
          )}
          {admin && (
            <a className="nav-link inline-flex items-center gap-1.5 text-ember-700" href="/admin">
              <Shield size={16} /> Admin
            </a>
          )}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-2">
          {anySignedIn ? (
            <NavUserMenu
              tenantUser={tenantUser}
              landlordUser={landlordUser}
              onTenantLogout={tenantLogout}
              onLandlordLogout={landlordLogout}
              onSwitchPersona={goSwitchPersona}
            />
          ) : (
            !authLoading && (
              <Link to="/login" className="btn btn-outline btn-sm">
                เข้าสู่ระบบ
              </Link>
            )
          )}
          <a href="tel:021680000" className="btn btn-outline btn-sm">
            <Phone size={16} /> 02-168-0000
          </a>
          <Link to="/contact-admin" className="btn btn-line btn-sm">
            <LineChat size={16} /> @assetaplus
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden w-12 h-12 grid place-items-center rounded-lg border border-navy-200 text-navy-700 hover:bg-navy-50"
          aria-label={open ? 'ปิดเมนู' : 'เปิดเมนู'}
          aria-expanded={open}
        >
          {open ? <Close size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden border-t border-line bg-white">
          <div className="container-page py-4 flex flex-col">
            <a className="nav-link py-3 text-base" href="/#hero" onClick={() => setOpen(false)}>หน้าแรก</a>
            {!anySignedIn && (
              <>
                <a className="nav-link py-3 text-base" href="/#how" onClick={() => setOpen(false)}>วิธีการ</a>
                <a className="nav-link py-3 text-base" href="/#listings" onClick={() => setOpen(false)}>ห้องว่าง</a>
                <Link className="nav-link py-3 text-base inline-flex items-center gap-2" to="/search" onClick={() => setOpen(false)}>
                  <Search size={14} /> ค้นหา
                </Link>
                <a className="nav-link py-3 text-base" href="/#landlords" onClick={() => setOpen(false)}>เจ้าของห้อง</a>
                <a className="nav-link py-3 text-base" href="/#faq" onClick={() => setOpen(false)}>คำถาม</a>
              </>
            )}
            {anySignedIn && (
              <Link className="nav-link py-3 text-base inline-flex items-center gap-2" to="/search" onClick={() => setOpen(false)}>
                <Search size={14} /> ค้นหา
              </Link>
            )}

            {/* Tenant-only / landlord-only / both-visible links */}
            {landlordUser && (
              <>
                <Link className="nav-link py-3 text-base inline-flex items-center gap-2" to="/dashboard" onClick={() => setOpen(false)}>
                  <Chart size={16} /> Dashboard
                </Link>
                <Link className="nav-link py-3 text-base inline-flex items-center gap-2" to="/my-listings" onClick={() => setOpen(false)}>
                  <Home size={16} /> ห้องของฉัน
                </Link>
                <Link className="nav-link py-3 text-base inline-flex items-center gap-2" to="/inquiries" onClick={() => setOpen(false)}>
                  <Inbox size={16} /> กล่องข้อความ
                </Link>
              </>
            )}
            {anySignedIn && (
              <Link className="nav-link py-3 text-base inline-flex items-center gap-2" to="/viewings" onClick={() => setOpen(false)}>
                <Calendar size={16} /> นัดชมห้อง
              </Link>
            )}

            {admin && (
              <a className="nav-link py-3 text-base inline-flex items-center gap-2 text-ember-700" href="/admin" onClick={() => setOpen(false)}>
                <Shield size={16} /> Admin
              </a>
            )}

            {/* Persona sign-out blocks */}
            {(tenantUser || landlordUser) && (
              <div className="mt-2 pt-3 border-t border-line space-y-3">
                {tenantUser && (
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-navy-100 grid place-items-center text-navy-700 font-semibold">
                        {(tenantUser.name || tenantUser.email || '?').slice(0, 1).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-navy-700 truncate">{tenantUser.name}</div>
                        <div className="text-xs text-muted">ผู้เช่า</div>
                      </div>
                    </div>
                    <button
                      onClick={() => { tenantLogout(); setOpen(false) }}
                      className="w-full btn btn-outline justify-center"
                    >
                      <LogOut size={16} /> ออกจากระบบ (ผู้เช่า)
                    </button>
                  </div>
                )}
                {landlordUser && (
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-ember-100 grid place-items-center text-ember-700 font-semibold">
                        {(landlordUser.name || landlordUser.email || '?').slice(0, 1).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-navy-700 truncate">{landlordUser.name}</div>
                        <div className="text-xs text-muted">ผู้ปล่อยเช่า</div>
                      </div>
                    </div>
                    <button
                      onClick={() => { landlordLogout(); setOpen(false) }}
                      className="w-full btn btn-outline justify-center"
                    >
                      <LogOut size={16} /> ออกจากระบบ (ผู้ปล่อยเช่า)
                    </button>
                  </div>
                )}
                <button
                  onClick={goSwitchPersona}
                  className="w-full btn btn-ghost justify-center"
                >
                  เพิ่ม / สลับบทบาท
                </button>
              </div>
            )}

            <div className="flex gap-2 pt-4 mt-3 border-t border-line">
              {!anySignedIn && !authLoading && (
                <Link to="/login" className="btn btn-outline flex-1" onClick={() => setOpen(false)}>
                  เข้าสู่ระบบ
                </Link>
              )}
              <a href="tel:021680000" className="btn btn-outline flex-1">
                <Phone size={16} /> โทร
              </a>
              <Link to="/contact-admin" className="btn btn-line flex-1" onClick={() => setOpen(false)}>
                <LineChat size={16} /> แชทไลน์
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
