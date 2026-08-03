// src/pages/AuthHandoff.jsx — Land here right after an SSO login.
//
// The OAuth callback runs on the API's host (that is the redirect_uri the
// provider has registered), so a session cookie set there belongs to the API
// host and the browser would never send it to this app's host. The callback
// therefore parks the cookies and sends us a one-time code; we redeem it from
// HERE, on the app's own origin, so the cookie lands where it is needed.
//
// See server/src/auth/loginHandoff.js for the full reasoning.

import { useEffect, useRef, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { api, ApiError } from '../api/client.js'

export default function AuthHandoff() {
  const [params] = useSearchParams()
  const [error, setError] = useState('')
  // StrictMode double-invokes effects in dev; the code is single-use, so a
  // second redeem would fail and show a spurious error.
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return
    ran.current = true

    const code = params.get('code')
    if (!code) { setError('ลิงก์ไม่สมบูรณ์'); return }

    // Drop the code from the address bar before anything else — it is a bearer
    // value and this stops it being kept in history or leaked via Referer.
    window.history.replaceState({}, '', '/auth/handoff')

    ;(async () => {
      try {
        const { next } = await api.redeemLoginHandoff(code)
        // Full page load, not a client-side navigate: AuthProvider resolves the
        // signed-in user once on mount, so a route change here would carry the
        // pre-login "logged out" state straight into RequireAuth and bounce
        // back to /login even though the cookie is now set.
        window.location.replace(next || '/')
      } catch (err) {
        setError(err instanceof ApiError
          ? err.message
          : 'เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง')
      }
    })()
  }, [])

  if (error) {
    return (
      <main className="container-page py-20 text-center">
        <h1 className="text-2xl font-bold text-navy-700">เข้าสู่ระบบไม่สำเร็จ</h1>
        <p className="mt-3 text-muted">{error}</p>
        <Link to="/login" className="btn btn-primary mt-6">กลับไปหน้าเข้าสู่ระบบ</Link>
      </main>
    )
  }

  return (
    <main className="container-page py-20 text-center" aria-live="polite">
      <div className="inline-block w-8 h-8 border-2 border-navy-200 border-t-navy-600 rounded-full animate-spin" />
      <p className="mt-4 text-muted">กำลังเข้าสู่ระบบ…</p>
    </main>
  )
}
