// src/components/admin/RequireAuth.jsx — Redirect to /admin/login when not authenticated.
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.jsx'

export default function RequireAuth({ children }) {
  const { admin, loading } = useAuth()
  const loc = useLocation()

  if (loading) {
    return (
      <div className="min-h-[60vh] grid place-items-center text-muted">
        กำลังตรวจสอบสิทธิ์…
      </div>
    )
  }
  if (!admin) {
    return <Navigate to="/admin/login" replace state={{ from: loc }} />
  }
  return children
}