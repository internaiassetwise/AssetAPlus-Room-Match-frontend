// src/components/admin/AdminLogin.jsx — Staff sign-in.
//
// Two paths to the same admin session:
//   1. Local username/password (`POST /auth/login`) — kept live per project
//      decision, drop in a later phase.
//   2. Microsoft / Azure AD SSO (`GET /auth/azure/start`) — when configured.
//
// Both end up at `admin` populated in AuthContext, so the rest of the admin
// UI doesn't care which path got you here.

import { useState } from 'react'
import { useNavigate, useLocation, Navigate, Link } from 'react-router-dom'
import Logo from '../Logo.jsx'
import { Key, ArrowRight } from '../icons.jsx'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { api, ApiError } from '../../api/client.js'

export default function AdminLogin() {
  const { admin, login } = useAuth()
  const navigate = useNavigate()
  const loc      = useLocation()
  const from     = loc.state?.from?.pathname || '/admin'

  const [form, setForm]     = useState({ username: '', password: '' })
  const [status, setStatus] = useState('idle')   // idle | sending | error
  const [error, setError]   = useState('')

  // Already signed in? Skip the form.
  if (admin) return <Navigate to={from} replace />

  const update = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }))

  async function onSubmit(ev) {
    ev.preventDefault()
    setStatus('sending')
    setError('')
    try {
      await login(form.username.trim(), form.password)
      navigate(from, { replace: true })
    } catch (err) {
      const msg = err instanceof ApiError
        ? (err.code === 'AUTH_BAD_CREDENTIALS' ? 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' : err.message)
        : 'เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'
      setError(msg)
      setStatus('error')
    }
  }

  return (
    <main className="min-h-screen bg-cream-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-8">
          <Logo className="h-12 w-40" />
          <span className="text-[11px] font-semibold text-ember-600 tracking-wider">ADMIN</span>
        </Link>

        <form onSubmit={onSubmit} noValidate className="card p-7 sm:p-8 space-y-5">
          <div>
            <h1 className="font-bold text-navy-700 text-2xl">เข้าสู่ระบบ Admin</h1>
            <p className="mt-2 text-muted text-sm">สำหรับเจ้าหน้าที่ AssetWise เท่านั้น</p>
          </div>

          <div>
            <label className="label" htmlFor="admin-username">ชื่อผู้ใช้</label>
            <input
              id="admin-username"
              autoComplete="username"
              className="input"
              value={form.username}
              onChange={update('username')}
              required
            />
          </div>

          <div>
            <label className="label" htmlFor="admin-password">รหัสผ่าน</label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              className="input"
              value={form.password}
              onChange={update('password')}
              required
            />
          </div>

          {error && (
            <div className="text-ember-700 text-sm bg-ember-50 border border-ember-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'sending'}
            className="btn btn-primary btn-lg w-full disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {status === 'sending' ? 'กำลังเข้าสู่ระบบ…' : 'เข้าสู่ระบบ'}
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs text-muted">
          <div className="flex-1 h-px bg-line" />
          หรือ
          <div className="flex-1 h-px bg-line" />
        </div>

        <a
          href={api.azureStartUrl('/admin')}
          className="btn btn-dark btn-lg w-full"
        >
          <Key size={18} /> Sign in with Microsoft (Azure AD)
        </a>
        <p className="mt-3 text-xs text-muted text-center">
          ใช้บัญชีอีเมลบริษัทที่ลงทะเบียนกับ AssetWise เท่านั้น
        </p>
      </div>
    </main>
  )
}