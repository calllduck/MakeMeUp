import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'

import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import HomePage from './pages/HomePage'
import DashboardPage from './pages/DashboardPage'
import ClientProfilePage from './pages/ClientProfilePage'
import MuaProfilePage from './pages/MuaProfilePage'
import MuaPackagesPage from './pages/MuaPackagesPage'
import MuaSchedulePage from './pages/MuaSchedulePage'
import SearchPage from './pages/SearchPage'
import MuaDetailPage from './pages/MuaDetailPage'
import BookingPage from './pages/BookingPage'
import BookingHistoryPage from './pages/BookingHistoryPage'
import BookingDetailPage from './pages/BookingDetailPage'
import PaymentPage from './pages/PaymentPage'
import InboxPage from './pages/InboxPage'
import ConversationPage from './pages/ConversationPage'

const PrivateRoute = ({ children, role }) => {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Memuat...</div>
  if (!user) return <Navigate to="/login" />
  if (role && user.role !== role) return <Navigate to="/" />
  return children
}

const App = () => {
  const { user, loading } = useAuth()

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-gray-400">Memuat...</div>
  )

  return (
    <>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/" />} />

        {/* Home — beda per role */}
        <Route path="/" element={
          !user ? <Navigate to="/login" /> :
          user.role === 'mua' ? <DashboardPage /> :
          <HomePage />
        } />

        {/* Client routes */}
        <Route path="/search" element={<PrivateRoute role="client"><SearchPage /></PrivateRoute>} />
        <Route path="/mua/:id" element={<PrivateRoute role="client"><MuaDetailPage /></PrivateRoute>} />
        <Route path="/booking/:muaId" element={<PrivateRoute role="client"><BookingPage /></PrivateRoute>} />
        <Route path="/bookings" element={<PrivateRoute role="client"><BookingHistoryPage /></PrivateRoute>} />
        <Route path="/bookings/:id" element={<PrivateRoute role="client"><BookingDetailPage /></PrivateRoute>} />
        <Route path="/payment/:bookingId" element={<PrivateRoute role="client"><PaymentPage /></PrivateRoute>} />
        <Route path="/profile/client" element={<PrivateRoute role="client"><ClientProfilePage /></PrivateRoute>} />

        {/* MUA routes */}
        <Route path="/mua/bookings" element={<PrivateRoute role="mua"><BookingHistoryPage /></PrivateRoute>} />
        <Route path="/mua/bookings/:id" element={<PrivateRoute role="mua"><BookingDetailPage /></PrivateRoute>} />
        <Route path="/mua/packages" element={<PrivateRoute role="mua"><MuaPackagesPage /></PrivateRoute>} />
        <Route path="/mua/schedules" element={<PrivateRoute role="mua"><MuaSchedulePage /></PrivateRoute>} />
        <Route path="/profile/mua" element={<PrivateRoute role="mua"><MuaProfilePage /></PrivateRoute>} />

        {/* Shared */}
        <Route path="/inbox" element={<PrivateRoute><InboxPage /></PrivateRoute>} />
        <Route path="/messages/:muaProfileId" element={<PrivateRoute><ConversationPage /></PrivateRoute>} />
      </Routes>
    </>
  )
}

export default App