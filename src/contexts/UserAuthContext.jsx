// src/contexts/UserAuthContext.jsx — Public-side (tenant) session state.
//
// On mount, calls /auth/user/me which restores the session from the
// user_session cookie. The server returns 204 when no cookie / no row,
// which the request wrapper turns into `null`. Mock and real OAuth both
// flow through this same code path — there is no env-var bypass here.

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { api } from '../api/client.js'

const UserAuthCtx = createContext(null)

export function UserAuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore session on first mount via the user_session cookie.
  useEffect(() => {
    let cancelled = false
    api.userMe()
      .then((u) => { if (!cancelled) setUser(u) })
      .catch(()  => { /* not authed — leave user=null */ })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const reload = useCallback(async () => {
    try {
      const u = await api.userMe()
      setUser(u)
    } catch {
      setUser(null)
    }
  }, [])

  const logout = useCallback(async () => {
    try { await api.userLogout() } catch { /* ignore */ }
    setUser(null)
  }, [])

  return (
    <UserAuthCtx.Provider value={{ user, loading, logout, reload }}>
      {children}
    </UserAuthCtx.Provider>
  )
}

export function useUserAuth() {
  const ctx = useContext(UserAuthCtx)
  if (!ctx) throw new Error('useUserAuth must be used inside <UserAuthProvider>')
  return ctx
}
