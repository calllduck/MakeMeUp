import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import ClientHome from './pages/ClientHome'

// Komponen shared
import Navbar from './components/Navbar'

// Halaman Auth
import Auth from './pages/Auth'

// Halaman publik
import Landing from './pages/Landing'
import Search   from './pages/Search'
import MuaDetail from './pages/MuaDetail'

// Halaman client
import ClientDashboard from './pages/ClientDashboard'
import Booking         from './pages/Booking'
import Messages        from './pages/Messages'

// Halaman MUA
import MuaDashboard from './pages/MuaDashboard'

// PrivateRoute — penjaga halaman yang butuh login
// Kalau belum login, otomatis dikirim ke /login
// Kalau role tidak sesuai, dikirim ke halaman utama
const PrivateRoute = ({ children, role }) => {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-gray-400">
      Memuat...
    </div>
  )
  if (!user) return <Navigate to="/login" />
  if (role && user.role !== role) return <Navigate to="/" />
  return children
}

const App = () => {
  const { user, loading } = useAuth()

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-gray-400">
      Memuat...
    </div>
  )

  return (
    <>
      <Navbar />
      <Routes>
        {/* Halaman utama — redirect sesuai role */}
        <Route path="/" element={
          !user              ? <Landing /> :
          user.role === 'mua' ? <Navigate to="/dashboard/mua" /> :
                               <Navigate to="/home/client" />
        } />

        {/* Auth — kalau sudah login, tidak bisa akses lagi */}
        <Route path="/login"    element={!user ? <Auth mode="login"    /> : <Navigate to="/" />} />
        <Route path="/register" element={!user ? <Auth mode="register" /> : <Navigate to="/" />} />

        {/* Publik */}
        <Route path="/search"   element={<Search />} />
        <Route path="/mua/:id"  element={<MuaDetail />} />

        {/* Client */}
        <Route path="/dashboard/client" element={
          <PrivateRoute role="client"><ClientDashboard /></PrivateRoute>
        } />
        <Route path="/booking/:muaId" element={
          <PrivateRoute role="client"><Booking /></PrivateRoute>
        } />

        {/* MUA */}
        <Route path="/dashboard/mua" element={
          <PrivateRoute role="mua"><MuaDashboard /></PrivateRoute>
        } />

        {/* Shared */}
        <Route path="/messages"          element={<PrivateRoute><Messages /></PrivateRoute>} />
        <Route path="/messages/:muaProfileId" element={<PrivateRoute><Messages /></PrivateRoute>} />

        <Route path="/home/client" element={
        <PrivateRoute role="client"><ClientHome /></PrivateRoute>} />

        {/* Fallback — kalau URL tidak dikenal */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </>
  )
}

export default App