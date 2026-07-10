import { Routes, Route, Navigate } from 'react-router-dom'
import Landing     from './components/Landing.jsx'
import RoomDetail  from './components/RoomDetail.jsx'
import { AuthProvider }      from './contexts/AuthContext.jsx'
import { UserAuthProvider }  from './contexts/UserAuthContext.jsx'
import { LandlordAuthProvider } from './contexts/LandlordAuthContext.jsx'
import RequireAuth           from './components/admin/RequireAuth.jsx'
import { RequireLandlord, RequireUser } from './components/RequireAuth.jsx'
import AdminLayout      from './components/admin/AdminLayout.jsx'
import AdminLogin       from './components/admin/AdminLogin.jsx'
import AdminRoomsList   from './components/admin/AdminRoomsList.jsx'
import AdminRoomForm    from './components/admin/AdminRoomForm.jsx'
import AdminFaqsList    from './components/admin/AdminFaqsList.jsx'
import AdminFaqForm     from './components/admin/AdminFaqForm.jsx'
import AdminInquiriesList from './components/admin/AdminInquiriesList.jsx'
import AdminPendingListings from './components/admin/AdminPendingListings.jsx'
import AdminViewings     from './components/admin/AdminViewings.jsx'
import AdminRoomSlots     from './components/admin/AdminRoomSlots.jsx'
import AdminInbox from './components/admin/AdminInbox.jsx'
import DevMockBanner    from './components/DevMockBanner.jsx'
import StickyLineCTA    from './components/StickyLineCTA.jsx'

// Public-facing user pages
import SearchPage        from './pages/SearchPage.jsx'
import MyListings        from './pages/MyListings.jsx'
import MyListingForm     from './pages/MyListingForm.jsx'
import Inquiries         from './pages/Inquiries.jsx'
import Viewings          from './pages/Viewings.jsx'
import Dashboard         from './pages/Dashboard.jsx'
import LoginPage         from './pages/LoginPage.jsx'
import ContactAdminPage  from './pages/ContactAdminPage.jsx'

export default function App() {
  return (
    <AuthProvider>
      <UserAuthProvider>
        <LandlordAuthProvider>
          <DevMockBanner />
          <Routes>
            <Route path="/"          element={<Landing />} />
            <Route path="/search"    element={<SearchPage />} />
            <Route path="/rooms/:id" element={<RoomDetail />} />
            <Route path="/contact-admin" element={<ContactAdminPage />} />

            <Route path="/login" element={<LoginPage />} />

            {/* Tenant-only routes — wrapped in RequireUser (enforces user_session) */}
            <Route path="/viewings" element={
              <RequireUser><Viewings /></RequireUser>
            } />

            {/* Landlord-only routes — wrapped in RequireLandlord.
                /my-listings/new redirects to /contact-admin?intent=list-a-room
                because landlords cannot self-create listings under the
                middleman flow — admin creates them via the Line chatbot. */}
            <Route path="/dashboard" element={
              <RequireLandlord><Dashboard /></RequireLandlord>
            } />
            <Route path="/my-listings" element={
              <RequireLandlord><MyListings /></RequireLandlord>
            } />
            <Route path="/my-listings/new" element={
              <RequireLandlord>
                <Navigate to="/contact-admin?intent=list-a-room" replace />
              </RequireLandlord>
            } />
            <Route path="/my-listings/:id/edit" element={
              <RequireLandlord><MyListingForm mode="edit" /></RequireLandlord>
            } />
            <Route path="/inquiries" element={
              <RequireLandlord><Inquiries /></RequireLandlord>
            } />

            <Route path="/admin/login" element={<AdminLogin />} />
            <Route element={<RequireAuth><AdminLayout /></RequireAuth>}>
              <Route path="/admin"               element={<AdminRoomsList />} />
              <Route path="/admin/rooms/new"     element={<AdminRoomForm mode="create" />} />
              <Route path="/admin/rooms/:id/edit" element={<AdminRoomForm mode="edit" />} />
              <Route path="/admin/rooms/:id/slots" element={<AdminRoomSlots />} />
              <Route path="/admin/faqs"          element={<AdminFaqsList />} />
              <Route path="/admin/faqs/new"      element={<AdminFaqForm mode="create" />} />
              <Route path="/admin/faqs/:id/edit" element={<AdminFaqForm mode="edit" />} />
              <Route path="/admin/pending-listings" element={<AdminPendingListings />} />
              <Route path="/admin/viewings" element={<AdminViewings />} />
              <Route path="/admin/inbox" element={<AdminInbox />} />
              <Route path="/admin/bot-inquiries" element={<AdminInquiriesList />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          {/* Persistent Line CTA. Self-hides on /contact-admin, /admin, /login. */}
          <StickyLineCTA />
        </LandlordAuthProvider>
      </UserAuthProvider>
    </AuthProvider>
  )
}