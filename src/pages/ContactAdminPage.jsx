// src/pages/ContactAdminPage.jsx — Single canonical "how to contact us" page.
//
// Reachable via `/contact-admin`. Anonymous-friendly. Used as the destination
// for all middleman-flow CTAs (room detail, my-listings, navbar "list a room",
// etc.) so the user always sees a single, predictable answer to "where do I
// talk to a human?"

import { useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import ContactAdminLineCTA from '../components/ContactAdminLineCTA.jsx'
import { LineChat, Phone, Home, Calendar, MessageSquare, Pencil, Sparkles } from '../components/icons.jsx'

// Local "image" icon — the shared icons.jsx doesn't expose one.
function ImageIcon(p) {
  return (
    <svg viewBox="0 0 24 24" width={p.size || 24} height={p.size || 24} fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={p.className}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  )
}

const INTENTS = [
  {
    intent: 'ask-about-room',
    icon:   MessageSquare,
    title:  'ถามรายละเอียดห้อง',
    blurb:  'สอบถามเรื่องค่าเช่า สภาพห้อง ทำเล หรือรายละเอียดอื่นๆ',
    who:    'ผู้เช่า',
    accent: 'navy',
  },
  {
    intent: 'view-a-room',
    icon:   Calendar,
    title:  'นัดชมห้อง',
    blurb:  'เลือกวันและเวลาที่สะดวก แอดมินจะช่วยยืนยันนัดให้',
    who:    'ผู้เช่า',
    accent: 'navy',
  },
  {
    intent: 'list-a-room',
    icon:   Home,
    title:  'ลงประกาศห้องใหม่',
    blurb:  'บอกรายละเอียดห้องและทำเล แอดมินจะลงประกาศให้',
    who:    'เจ้าของห้อง',
    accent: 'ember',
  },
  {
    intent: 'edit-description',
    icon:   Pencil,
    title:  'แก้ไขรายละเอียดห้อง',
    blurb:  'เปลี่ยนรายละเอียด สิ่งอำนวยความสะดวก หรือเงื่อนไข',
    who:    'เจ้าของห้อง',
    accent: 'ember',
  },
  {
    intent: 'upload-photos',
    icon:   ImageIcon,
    title:  'อัปโหลดรูปภาพเพิ่มเติม',
    blurb:  'ส่งรูปภาพเข้ามาทาง Line แอดมินจะอัปโหลดให้',
    who:    'เจ้าของห้อง',
    accent: 'ember',
  },
]

function IntentCard({ intent, icon: Icon, title, blurb, who, accent }) {
  const accentCls = accent === 'ember'
    ? 'border-ember-200 bg-ember-50/40'
    : 'border-navy-200 bg-navy-50/40'
  const iconCls = accent === 'ember'
    ? 'bg-ember-100 text-ember-700'
    : 'bg-navy-100 text-navy-700'
  const chipCls = accent === 'ember'
    ? 'bg-ember-50 text-ember-700 border-ember-200'
    : 'bg-navy-50 text-navy-700 border-navy-200'

  return (
    <article className={`card p-6 border ${accentCls}`}>
      <div className="flex items-start gap-4">
        <div className={`w-11 h-11 rounded-lg grid place-items-center shrink-0 ${iconCls}`}>
          <Icon size={22} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-navy-700 text-base">{title}</h3>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${chipCls}`}>
              {who}
            </span>
          </div>
          <p className="mt-1.5 text-sm text-muted leading-relaxed">{blurb}</p>
          <div className="mt-4">
            <ContactAdminLineCTA
              intent={intent}
              variant="bare"
              showPhone={false}
              label="แชทเลย"
            />
          </div>
        </div>
      </div>
    </article>
  )
}

export default function ContactAdminPage() {
  const [params] = useSearchParams()
  const initialIntent = params.get('intent')

  return (
    <>
      <Navbar />
      <main className="bg-cream-50 min-h-screen">
        <div className="container-page py-14 sm:py-20 max-w-5xl">
          {/* Hero */}
          <header className="text-center mb-10">
            <span className="eyebrow"><Sparkles size={14} /> ติดต่อแอดมิน</span>
            <h1 className="mt-4 text-3xl sm:text-4xl font-bold text-navy-700 tracking-tight">
              ทุกเรื่อง<span className="text-ember-600"> ติดต่อแอดมิน</span> ทาง Line
            </h1>
            <p className="mt-3 text-muted text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              เว็บไซต์นี้เป็นตัวกลางระหว่างผู้เช่ากับเจ้าของห้อง
              เลือกหัวข้อด้านล่าง แล้วแอดมินจะช่วยดูแลต่อให้ทันที
            </p>
          </header>

          {/* Top CTA card */}
          <div className="card p-7 sm:p-8 mb-10 shadow-lift border-navy-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="w-14 h-14 rounded-xl bg-[#06C755] grid place-items-center text-white shrink-0">
                <LineChat size={28} />
              </div>
              <div className="flex-1">
                <h2 className="text-lg sm:text-xl font-bold text-navy-700">แชท Line @assetaplus</h2>
                <p className="mt-1 text-muted">
                  ตอบเร็วที่สุด · จันทร์–เสาร์ 9:00–18:00
                </p>
              </div>
              <a
                href="https://line.me/R/ti/p/@assetaplus"
                target="_blank"
                rel="noreferrer noopener"
                className="btn bg-[#06C755] text-white hover:bg-[#05b34c] btn-lg"
              >
                <LineChat size={18} /> เปิดแชทเลย
              </a>
            </div>
          </div>

          {/* Intent grid */}
          <section className="mb-10">
            <h2 className="text-lg font-bold text-navy-700 mb-4">
              เลือกหัวข้อที่ต้องการติดต่อ
              {initialIntent && (
                <span className="ml-2 text-sm font-normal text-muted">
                  (แนะนำ: {INTENTS.find((i) => i.intent === initialIntent)?.title || initialIntent})
                </span>
              )}
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {INTENTS.map((i) => (
                <IntentCard key={i.intent} {...i} />
              ))}
            </div>
          </section>

          {/* Phone + hours */}
          <section className="card p-7 bg-white">
            <h2 className="text-lg font-bold text-navy-700 mb-4">ช่องทางอื่น</h2>
            <div className="grid sm:grid-cols-2 gap-5">
              <a
                href="tel:021680000"
                className="flex items-start gap-3 p-4 rounded-xl border border-line hover:border-navy-300 hover:bg-navy-50 transition-colors"
              >
                <Phone size={20} className="text-navy-600 mt-0.5" />
                <div>
                  <div className="font-semibold text-navy-700">โทร 02-168-0000</div>
                  <div className="text-sm text-muted mt-1">จันทร์–เสาร์ 9:00–18:00</div>
                </div>
              </a>
              <a
                href="mailto:hello@assetaplus.co.th"
                className="flex items-start gap-3 p-4 rounded-xl border border-line hover:border-navy-300 hover:bg-navy-50 transition-colors"
              >
                <MessageSquare size={20} className="text-navy-600 mt-0.5" />
                <div>
                  <div className="font-semibold text-navy-700">hello@assetaplus.co.th</div>
                  <div className="text-sm text-muted mt-1">ตอบกลับภายใน 1 วันทำการ</div>
                </div>
              </a>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}