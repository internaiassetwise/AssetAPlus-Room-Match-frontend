import { Routes, Route, Navigate } from 'react-router-dom'
import Landing     from './components/Landing.jsx'
import RoomDetail  from './components/RoomDetail.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
import RequireAuth      from './components/admin/RequireAuth.jsx'
import AdminLayout      from './components/admin/AdminLayout.jsx'
import AdminLogin       from './components/admin/AdminLogin.jsx'
import AdminRoomsList   from './components/admin/AdminRoomsList.jsx'
import AdminRoomForm    from './components/admin/AdminRoomForm.jsx'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/"          element={<Landing />} />
        <Route path="/rooms/:id" element={<RoomDetail />} />

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route element={<RequireAuth><AdminLayout /></RequireAuth>}>
          <Route path="/admin"               element={<AdminRoomsList />} />
          <Route path="/admin/rooms/new"     element={<AdminRoomForm mode="create" />} />
          <Route path="/admin/rooms/:id/edit" element={<AdminRoomForm mode="edit" />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}