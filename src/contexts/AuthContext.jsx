// src/contexts/AuthContext.jsx — Admin session state for the entire app.
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { api } from '../api/client.js'

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
  const [admin, setAdmin]   = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore session on first mount via the admin_session cookie.
  useEffect(() => {
    let cancelled = false
    api.adminMe()
      .then((a) => { if (!cancelled) setAdmin(a) })
      .catch(()  => { /* not authed — leave admin=null */ })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const login = useCallback(async (username, password) => {
    const a = await api.adminLogin({ username, password })
    setAdmin(a)
    return a
  }, [])

  const logout = useCallback(async () => {
    try { await api.adminLogout() } catch { /* ignore */ }
    setAdmin(null)
  }, [])

  return (
    <AuthCtx.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AuthCtx.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthCtx)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}