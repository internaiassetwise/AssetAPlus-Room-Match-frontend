// src/components/NavUserMenu.jsx — Avatar dropdown supporting one OR two personas.
//
// The menu shows one block per active persona. If both tenant + landlord
// sessions exist, both are visible with a divider and a "switch / add
// persona" button at the bottom. The avatar that opens the menu is the
// tenant's picture if signed in, otherwise the landlord's.
//
// `onSwitchPersona` (typically `() => navigate('/login')`) lets the user
// sign in as the other role from the same dropdown.

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LogOut, ChevronDown, Chart, Home, Inbox, Calendar, RotateCw } from './icons.jsx'

const TENANT_LINKS = [
  { to: '/viewings', icon: Calendar, label: 'นัดชมห้อง' },
]

const LANDLORD_LINKS = [
  { to: '/dashboard',   icon: Chart,    label: 'Dashboard' },
  { to: '/my-listings', icon: Home,     label: 'ห้องของฉัน' },
  { to: '/inquiries',   icon: Inbox,    label: 'กล่องข้อความ' },
  { to: '/viewings',    icon: Calendar, label: 'นัดชมห้อง' },
]

function RoleChip({ label, tone }) {
  const cls = tone === 'ember'
    ? 'bg-ember-50 text-ember-700 border-ember-200'
    : 'bg-navy-50 text-navy-700 border-navy-200'
  return (
    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${cls}`}>
      {label}
    </span>
  )
}

function MenuLink({ to, icon: Icon, children, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-navy-700 hover:bg-navy-50"
    >
      <Icon size={16} /> {children}
    </Link>
  )
}

function Avatar({ user, size = 'w-9 h-9 text-sm' }) {
  if (user.picture) {
    return <img src={user.picture} alt="" className={`${size} rounded-full ring-2 ring-line`} />
  }
  return (
    <div className={`${size} rounded-full bg-navy-100 grid place-items-center text-navy-700 font-semibold`}>
      {(user.name || user.email || '?').slice(0, 1).toUpperCase()}
    </div>
  )
}

function PersonaBlock({ user, role, tone, links, onLogout, onCloseMenu }) {
  return (
    <>
      <div className="px-4 py-3 border-b border-line">
        <div className="flex items-center gap-3">
          <Avatar user={user} size="w-9 h-9 text-sm" />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-navy-700 truncate">{user.name}</div>
            <div className="text-xs text-muted truncate">{user.email}</div>
          </div>
          <RoleChip label={role} tone={tone} />
        </div>
      </div>
      <div className="py-1.5">
        {links.map((l) => (
          <MenuLink key={l.to} to={l.to} icon={l.icon} onClick={onCloseMenu}>{l.label}</MenuLink>
        ))}
      </div>
      <button
        type="button"
        onClick={() => { onCloseMenu(); onLogout() }}
        className="w-full px-4 py-3 text-left text-sm text-navy-700 hover:bg-navy-50 flex items-center gap-2 border-t border-line"
      >
        <LogOut size={16} /> ออกจากระบบ
      </button>
    </>
  )
}

export default function NavUserMenu({ tenantUser, landlordUser, onTenantLogout, onLandlordLogout, onSwitchPersona }) {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  // Determine the avatar shown on the trigger button: prefer tenant, fall back to landlord.
  const primary   = tenantUser || landlordUser
  const primaryTone = tenantUser ? 'navy' : 'ember'
  const bothActive  = !!(tenantUser && landlordUser)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-navy-50 transition-colors"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Avatar user={primary} />
        <span className="text-sm font-medium text-navy-700 max-w-[120px] truncate">
          {primary.name}
        </span>
        {bothActive && (
          <span className="text-[10px] font-semibold text-ember-700 bg-ember-50 border border-ember-200 px-1.5 py-0.5 rounded-full">
            +1
          </span>
        )}
        <ChevronDown size={14} className="text-navy-400" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={close} />
          <div className="absolute right-0 top-full mt-2 z-40 w-80 rounded-xl border border-line bg-white shadow-lift overflow-hidden max-h-[80vh] overflow-y-auto">
            {tenantUser && (
              <PersonaBlock
                user={tenantUser}
                role="ผู้เช่า"
                tone="navy"
                links={TENANT_LINKS}
                onLogout={onTenantLogout}
                onCloseMenu={close}
              />
            )}
            {tenantUser && landlordUser && <div className="border-t border-line" />}
            {landlordUser && (
              <PersonaBlock
                user={landlordUser}
                role="ผู้ปล่อยเช่า"
                tone="ember"
                links={LANDLORD_LINKS}
                onLogout={onLandlordLogout}
                onCloseMenu={close}
              />
            )}

            <button
              type="button"
              onClick={() => { close(); onSwitchPersona?.() }}
              className="w-full px-4 py-3 text-left text-sm text-navy-700 hover:bg-navy-50 flex items-center gap-2 border-t border-line"
            >
              <RotateCw size={16} className="text-ember-600" />
              {bothActive ? 'เพิ่ม / สลับบทบาท' : 'สลับเป็นอีกบทบาท'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
