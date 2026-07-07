import { useEffect, useState } from 'react'
import { Phone, LineChat, Key, Menu, Close, Shield } from './icons.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { admin } = useAuth()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-200 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-md border-b border-line shadow-soft'
          : 'bg-white border-b border-transparent'
      }`}
    >
      <nav className="container-page flex items-center justify-between h-20">
        {/* Logo */}
        <a href="#hero" className="flex items-center gap-3 group">
          <span className="w-11 h-11 rounded-lg bg-navy-600 text-white grid place-items-center group-hover:bg-navy-700 transition-colors">
            <Key size={22} />
          </span>
          <div className="leading-none">
            <div className="font-bold text-navy-700 text-base tracking-tight">Room Match</div>
            <div className="text-[11px] font-semibold text-ember-600 tracking-[0.18em] mt-1">ASSET A PLUS</div>
          </div>
        </a>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-1">
          <a className="nav-link" href="#hero">หน้าแรก</a>
          <a className="nav-link" href="#how">วิธีการ</a>
          <a className="nav-link" href="#listings">ห้องว่าง</a>
          <a className="nav-link" href="#landlords">เจ้าของห้อง</a>
          <a className="nav-link" href="#faq">คำถาม</a>
          {admin && (
            <a className="nav-link inline-flex items-center gap-1.5 text-ember-700" href="/admin">
              <Shield size={16} /> Admin
            </a>
          )}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-2">
          <a href="tel:021680000" className="btn btn-outline btn-sm">
            <Phone size={16} /> 02-168-0000
          </a>
          <a href="#cta" className="btn btn-line btn-sm">
            <LineChat size={16} /> @assetaplus
          </a>
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
            <a className="nav-link py-3 text-base" href="#hero" onClick={() => setOpen(false)}>หน้าแรก</a>
            <a className="nav-link py-3 text-base" href="#how" onClick={() => setOpen(false)}>วิธีการ</a>
            <a className="nav-link py-3 text-base" href="#listings" onClick={() => setOpen(false)}>ห้องว่าง</a>
            <a className="nav-link py-3 text-base" href="#landlords" onClick={() => setOpen(false)}>เจ้าของห้อง</a>
            <a className="nav-link py-3 text-base" href="#faq" onClick={() => setOpen(false)}>คำถาม</a>
            {admin && (
              <a className="nav-link py-3 text-base inline-flex items-center gap-2 text-ember-700" href="/admin" onClick={() => setOpen(false)}>
                <Shield size={16} /> Admin
              </a>
            )}
            <div className="flex gap-2 pt-4 mt-3 border-t border-line">
              <a href="tel:021680000" className="btn btn-outline flex-1">
                <Phone size={16} /> โทร
              </a>
              <a href="#cta" className="btn btn-line flex-1">
                <LineChat size={16} /> แชทไลน์
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}