// src/components/RequireAuth.jsx — Route guards for tenant + landlord pages.
//
// Usage:
//   import { RequireLandlord, RequireUser } from '../components/RequireAuth.jsx'
//   <Route path="/dashboard" element={<RequireLandlord><Dashboard /></RequireLandlord>} />
//
// Not-signed-in users are redirected to /login?return=<current-path> so the
// login page can bounce them back after sign-in. Loading is silent (returns
// null) to avoid layout-shift; long loads should be unusual because the
// session cookie is restored on mount.

import { Navigate, useLocation } from 'react-router-dom'
import { useUserAuth }     from '../contexts/UserAuthContext.jsx'
import { useLandlordAuth } from '../contexts/LandlordAuthContext.jsx'

function LoginRedirect() {
  const loc = useLocation()
  const search = `?return=${encodeURIComponent(loc.pathname + (loc.search || ''))}`
  return <Navigate to={`/login${search}`} replace />
}

export function RequireUser({ children }) {
  const { user, loading } = useUserAuth()
  if (loading) return null
  if (!user)   return <LoginRedirect />
  return children
}

export function RequireLandlord({ children }) {
  const { landlord, loading } = useLandlordAuth()
  if (loading) return null
  if (!landlord) return <LoginRedirect />
  return children
}
