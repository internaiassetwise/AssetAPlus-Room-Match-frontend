// src/components/DevMockBanner.jsx — Sticky banner that surfaces the active
// mock persona (tenant and/or landlord) and offers a "switch" link to /login.
//
// Shown whenever a user_session or landlord_session cookie is present —
// i.e. while MOCK_AUTH=true is set on the backend. When real OAuth takes
// over and MOCK_AUTH is flipped off, the mock-login endpoint returns 404
// and no cookies are ever set, so the banner stays hidden automatically
// (the early-return on !tenantUser && !landlordUser guards this).

import { Link } from 'react-router-dom'
import { Sparkles } from './icons.jsx'
import { useUserAuth }     from '../contexts/UserAuthContext.jsx'
import { useLandlordAuth } from '../contexts/LandlordAuthContext.jsx'

export default function DevMockBanner() {
  const { user: tenantUser }     = useUserAuth()
  const { landlord: landlordUser } = useLandlordAuth()

  if (!tenantUser && !landlordUser) return null

  // Show landlord first when both are active, so demo viewers see the
  // landlord-side persona most prominently. The switch link goes to /login
  // either way.
  const active    = landlordUser ?? tenantUser
  const role      = landlordUser ? 'ผู้ปล่อยเช่า' : 'ผู้เช่า'
  const otherRole = landlordUser ? 'ผู้เช่า' : 'ผู้ปล่อยเช่า'
  const bothActive = !!(tenantUser && landlordUser)

  return (
    <div className="sticky top-0 z-[60] bg-amber-50 border-b border-amber-200 px-4 py-1.5 text-xs text-amber-900 flex items-center gap-2 flex-wrap">
      <Sparkles size={12} className="text-amber-700 shrink-0" />
      <span className="font-semibold">โหมด Mock:</span>
      <span>
        เข้าสู่ระบบเป็น <span className="font-semibold">{active.name || active.email}</span> · {role}
      </span>
      <span className="text-amber-700/60">·</span>
      <Link to="/login" className="underline hover:text-amber-900">
        {bothActive ? 'เพิ่ม/สลับเป็น' : `สลับเป็น${otherRole}`}
      </Link>
    </div>
  )
}
