// src/components/admin/AdminInbox.jsx — Unified admin Inbox.
//
// One place for everything customer-facing, spanning BOTH tenants and landlords:
//   • ข้อความ  (InboxQueue)    — bot escalations + live takeover chat.
//   • รายชื่อ  (AdminContacts) — tenant + landlord directory (+ create landlord).
//
// Consolidates what used to be two separate sidebar items ("Inbox ข้อความจากบอท"
// and "รายชื่อผู้เช่า") into a single tabbed screen. Tab state is local — one
// sidebar entry, no extra route.

import { useState } from 'react'
import { Inbox, Users } from '../icons.jsx'
import InboxQueue from './InboxQueue.jsx'
import AdminContacts from './AdminContacts.jsx'

const TABS = [
  { key: 'messages', label: 'ข้อความ', Icon: Inbox },
  { key: 'contacts', label: 'รายชื่อ', Icon: Users },
]

export default function AdminInbox() {
  const [tab, setTab] = useState('messages')

  return (
    <section>
      <div className="mb-6">
        <span className="eyebrow-navy">แอดมิน</span>
        <h1 className="mt-3 font-bold text-navy-700 text-3xl sm:text-4xl tracking-tight">
          Inbox
        </h1>
        <p className="mt-2 text-muted max-w-2xl">
          ข้อความจากแชทบอทและรายชื่อผู้เช่า/เจ้าของห้อง รวมอยู่ที่เดียว —
          กด <b>รับเรื่อง</b> ในแท็บข้อความเพื่อคุยกับลูกค้าเอง หรือดู/เพิ่มรายชื่อในแท็บรายชื่อ
        </p>
      </div>

      {/* Tab bar */}
      <div role="tablist" className="flex flex-wrap gap-2 mb-6 border-b border-line">
        {TABS.map(({ key, label, Icon }) => {
          const active = tab === key
          return (
            <button
              key={key}
              role="tab"
              aria-selected={active}
              onClick={() => setTab(key)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 -mb-px border-b-2 text-sm font-semibold transition-colors ${
                active
                  ? 'border-navy-700 text-navy-700'
                  : 'border-transparent text-muted hover:text-navy-700'
              }`}
            >
              <Icon size={16} /> {label}
            </button>
          )
        })}
      </div>

      {tab === 'messages' ? <InboxQueue /> : <AdminContacts />}
    </section>
  )
}
