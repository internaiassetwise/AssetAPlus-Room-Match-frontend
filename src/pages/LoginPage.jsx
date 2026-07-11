// src/pages/LoginPage.jsx — Persona-based mock login.
//
// Two personas seeded in DB, one tenant (id=1) and one landlord (id=1). Clicking
// a card POSTs the persona to /api/auth/mock/login which creates a session row
// and sets the matching cookie (user_session or landlord_session). When real
// OAuth lands, this page gets replaced with the Google sign-in button.

import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Search, Key, ArrowRight, Home, MessageSquare, Sparkles, Calendar, LineChat } from '../components/icons.jsx'
import { api, ApiError } from '../api/client.js'
import { useUserAuth }     from '../contexts/UserAuthContext.jsx'
import { useLandlordAuth } from '../contexts/LandlordAuthContext.jsx'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'

const PERSONAS = [
  {
    key:       'tenant',
    name:      'คุณสมชาย ใจดี',
    role:      'ผู้เช่า',
    blurb:     'กำลังมองหาห้องพัก',
    monogram:  'ส',
    tone:      'navy',
    accent:   'bg-navy-50 text-navy-700 border-navy-100',
    cta:       'เข้าสู่ระบบในฐานะผู้เช่า',
    features: [
      { icon: Home,          label: 'ดูห้องทั้งหมดบนแผนที่' },
      { icon: MessageSquare, label: 'ส่งข้อความถึงเจ้าของห้อง' },
      { icon: Calendar,      label: 'นัดชมห้องตามวัน/เวลาที่สะดวก' },
    ],
  },
  {
    key:       'landlord',
    name:      'คุณพลอย สุขสมบูรณ์',
    role:      'ผู้ปล่อยเช่า',
    blurb:     'มีห้องให้เช่า 5 ห้อง',
    monogram:  'พ',
    tone:      'ember',
    accent:   'bg-ember-50 text-ember-700 border-ember-100',
    cta:       'เข้าสู่ระบบในฐานะผู้ปล่อยเช่า',
    features: [
      { icon: Home,          label: 'จัดการประกาศห้องของคุณ' },
      { icon: MessageSquare, label: 'ตอบข้อความจากผู้สนใจ' },
      { icon: Calendar,      label: 'ยืนยัน/ปฏิเสธการนัดชมห้อง' },
    ],
  },
]

function PersonaCard({ persona, signedIn, busy, onPick }) {
  return (
    <article className="card card-hover overflow-hidden flex flex-col">
      {/* Persona header */}
      <div className={`px-7 py-7 border-b ${persona.accent}`}>
        <div className="flex items-center gap-4">
          <div className="monogram w-14 h-14 text-xl bg-white">
            {persona.monogram}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-navy-700 text-xl leading-tight truncate">
              {persona.name}
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${persona.accent}`}>
                {persona.role}
              </span>
            </div>
          </div>
        </div>
        <p className="mt-4 text-navy-700 text-[15px]">{persona.blurb}</p>
      </div>

      {/* Feature list */}
      <ul className="px-7 py-6 space-y-3 flex-1">
        {persona.features.map(({ icon: Icon, label }) => (
          <li key={label} className="flex items-start gap-3 text-[15px] text-navy-700">
            <span className={`mt-0.5 w-6 h-6 rounded-md grid place-items-center shrink-0 ${persona.tone === 'navy' ? 'bg-navy-50 text-navy-600' : 'bg-ember-50 text-ember-600'}`}>
              <Icon size={14} />
            </span>
            <span>{label}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <div className="px-7 pb-7">
        {signedIn ? (
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-emerald-800 text-sm">
            ✓ คุณเข้าสู่ระบบอยู่แล้วในฐานะ {persona.role}
          </div>
        ) : (
          <button
            type="button"
            className="btn w-full bg-[#06C755] text-white hover:bg-[#05b34c]"
            onClick={() => onPick(persona.key)}
          >
            <LineChat size={16} /> เข้าสู่ระบบด้วย Line
          </button>
        )}
      </div>
    </article>
  )
}

export default function LoginPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const returnTo = params.get('return') || '/'

  const { user: tenantUser,   reload: reloadTenant   } = useUserAuth()
  const { landlord: landlordUser, reload: reloadLandlord } = useLandlordAuth()

  const [error, setError] = useState('')

  // Primary: Line Login — a full redirect to the backend OAuth start. The browser
  // leaves to Line's consent screen and returns with a session cookie (or two, if
  // the user is both a tenant and a landlord).
  function loginLine(persona) {
    const dest = returnTo && returnTo !== '/'
      ? returnTo
      : (persona === 'landlord' ? '/dashboard' : '/viewings')
    window.location.href = `/api/auth/line/start?role=${persona}&return=${encodeURIComponent(dest)}`
  }

  // If both personas are already active, skip the picker entirely.
  useEffect(() => {
    if (tenantUser && landlordUser) {
      navigate(returnTo.startsWith('/') ? returnTo : '/', { replace: true })
    }
  }, [tenantUser, landlordUser, navigate, returnTo])

  return (
    <div className="min-h-screen flex flex-col bg-cream-50">
      <Navbar />

      <main className="flex-1">
        <section className="container-page py-14 sm:py-20">
          <div className="max-w-4xl mx-auto">
            <span className="eyebrow">
              <Sparkles size={14} className="text-ember-600" />
              เข้าสู่ระบบด้วย Line
            </span>
            <h1 className="mt-4 font-bold text-navy-700 text-4xl sm:text-5xl tracking-tight">
              เลือกบทบาทเพื่อ<span className="text-ember-600"> เข้าสู่ระบบ</span>
            </h1>
            <p className="mt-4 text-navy-700 text-[17px] leading-relaxed max-w-2xl">
              ล็อกอินด้วยบัญชี Line เดียวกับที่คุยกับบอท — เลือกเข้ามาในฐานะผู้เช่าหรือผู้ปล่อยเช่า
              หากคุณเป็นทั้งสองบทบาท จะสลับไปมาได้ในหน้าเดียวหลังล็อกอิน
            </p>

            {(error || params.get('line_error')) && (
              <div className="mt-6 rounded-lg bg-ember-50 border border-ember-200 px-4 py-3 text-ember-800 text-sm">
                {error || 'เข้าสู่ระบบด้วย Line ไม่สำเร็จหรือถูกยกเลิก กรุณาลองอีกครั้ง'}
              </div>
            )}

            <div className="mt-10 grid sm:grid-cols-2 gap-6">
              {PERSONAS.map((p) => (
                <PersonaCard
                  key={p.key}
                  persona={p}
                  signedIn={p.key === 'tenant' ? !!tenantUser : !!landlordUser}
                  onPick={loginLine}
                />
              ))}
            </div>

            <p className="mt-10 text-muted text-sm text-center">
              <Link to="/" className="hover:text-navy-700 underline">
                กลับหน้าแรก
              </Link>
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}