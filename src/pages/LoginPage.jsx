// src/pages/LoginPage.jsx — Line Login role picker.
//
// Two roles a person can hold: tenant (ผู้เช่า) and landlord (ผู้ปล่อยเช่า).
// Each card redirects to the backend Line OAuth start with the chosen role; the
// callback sets user_session and/or landlord_session (a single Line account can
// be both, so after login the role can be switched in-page).

import { useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Home, Key, MessageSquare, Sparkles, Calendar, LineChat } from '../components/icons.jsx'
import { useUserAuth }     from '../contexts/UserAuthContext.jsx'
import { useLandlordAuth } from '../contexts/LandlordAuthContext.jsx'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'

const ROLES = [
  {
    key:       'tenant',
    role:      'ผู้เช่า',
    tagline:   'กำลังมองหาห้องเช่า',
    tone:      'navy',
    accent:    'bg-navy-50 text-navy-700 border-navy-100',
    features: [
      { icon: Home,          label: 'ดูห้องทั้งหมดบนแผนที่' },
      { icon: MessageSquare, label: 'ส่งข้อความถึงเจ้าของห้อง' },
      { icon: Calendar,      label: 'นัดชมห้องตามวัน/เวลาที่สะดวก' },
    ],
  },
  {
    key:       'landlord',
    role:      'ผู้ปล่อยเช่า',
    tagline:   'มีห้องให้เช่า',
    tone:      'ember',
    accent:    'bg-ember-50 text-ember-700 border-ember-100',
    features: [
      { icon: Home,          label: 'จัดการประกาศห้องของคุณ' },
      { icon: MessageSquare, label: 'ตอบข้อความจากผู้สนใจ' },
      { icon: Calendar,      label: 'ยืนยัน/ปฏิเสธการนัดชมห้อง' },
    ],
  },
]

function RoleCard({ role, signedIn, onPick }) {
  const Icon = role.tone === 'navy' ? Home : Key
  return (
    <article className="card card-hover overflow-hidden flex flex-col">
      {/* Role header */}
      <div className={`px-7 py-7 border-b ${role.accent}`}>
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl grid place-items-center text-white shrink-0 ${role.tone === 'navy' ? 'bg-navy-600' : 'bg-ember-600'}`}>
            <Icon size={26} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-navy-700 text-2xl leading-tight">
              {role.role}
            </div>
            <p className="mt-1 text-navy-700 text-[15px]">{role.tagline}</p>
          </div>
        </div>
      </div>

      {/* Feature list */}
      <ul className="px-7 py-6 space-y-3 flex-1">
        {role.features.map(({ icon: FIcon, label }) => (
          <li key={label} className="flex items-start gap-3 text-[15px] text-navy-700">
            <span className={`mt-0.5 w-6 h-6 rounded-md grid place-items-center shrink-0 ${role.tone === 'navy' ? 'bg-navy-50 text-navy-600' : 'bg-ember-50 text-ember-600'}`}>
              <FIcon size={14} />
            </span>
            <span>{label}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <div className="px-7 pb-7">
        {signedIn ? (
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-emerald-800 text-sm">
            ✓ คุณเข้าสู่ระบบอยู่แล้วในฐานะ {role.role}
          </div>
        ) : (
          <button
            type="button"
            className="btn w-full bg-[#06C755] text-white hover:bg-[#05b34c]"
            onClick={() => onPick(role.key)}
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

  const { user: tenantUser } = useUserAuth()
  const { landlord: landlordUser } = useLandlordAuth()

  // Primary: Line Login — a full redirect to the backend OAuth start. The browser
  // leaves to Line's consent screen and returns with a session cookie (or two, if
  // the user is both a tenant and a landlord).
  function loginLine(persona) {
    const dest = returnTo && returnTo !== '/'
      ? returnTo
      : (persona === 'landlord' ? '/dashboard' : '/viewings')
    window.location.href = `/api/auth/line/start?role=${persona}&return=${encodeURIComponent(dest)}`
  }

  // If both roles are already active, skip the picker entirely.
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

            {params.get('line_error') && (
              <div className="mt-6 rounded-lg bg-ember-50 border border-ember-200 px-4 py-3 text-ember-800 text-sm">
                เข้าสู่ระบบด้วย Line ไม่สำเร็จหรือถูกยกเลิก กรุณาลองอีกครั้ง
              </div>
            )}

            <div className="mt-10 grid sm:grid-cols-2 gap-6">
              {ROLES.map((r) => (
                <RoleCard
                  key={r.key}
                  role={r}
                  signedIn={r.key === 'tenant' ? !!tenantUser : !!landlordUser}
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
