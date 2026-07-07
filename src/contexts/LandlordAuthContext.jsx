// src/contexts/LandlordAuthContext.jsx — Landlord-side session state.
//
// Mirrors UserAuthContext exactly: on mount it asks the server for
// /auth/landlord/me and stores the result. The mock-login endpoint sets the
// same landlord_session cookie that real OAuth will, so this context works
// identically for both modes.

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { api } from '../api/client.js'

const LandlordAuthCtx = createContext(null)

export function LandlordAuthProvider({ children }) {
  const [landlord, setLandlord] = useState(null)
  const [loading, setLoading]   = useState(true)

  // Restore session on first mount via the landlord_session cookie.
  useEffect(() => {
    let cancelled = false
    api.landlordMe()
      .then((u)  => { if (!cancelled) setLandlord(u) })
      .catch(()  => { /* not authed — leave landlord=null */ })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const reload = useCallback(async () => {
    try {
      const u = await api.landlordMe()
      setLandlord(u)
    } catch {
      setLandlord(null)
    }
  }, [])

  const logout = useCallback(async () => {
    try { await api.landlordLogout() } catch { /* ignore */ }
    setLandlord(null)
  }, [])

  return (
    <LandlordAuthCtx.Provider value={{ landlord, loading, logout, reload }}>
      {children}
    </LandlordAuthCtx.Provider>
  )
}

export function useLandlordAuth() {
  const ctx = useContext(LandlordAuthCtx)
  if (!ctx) throw new Error('useLandlordAuth must be used inside <LandlordAuthProvider>')
  return ctx
}
