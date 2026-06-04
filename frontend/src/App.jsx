import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import RegisterPage from './pages/RegisterPage'
import LoginPage from './pages/LoginPage'
import ClientProfilePage from './pages/ClientProfilePage'
import MuaProfilePage from './pages/MuaProfilePage'

const App = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/profile/client" element={<ClientProfilePage />} />
      <Route path="/profile/mua" element={<MuaProfilePage />} />
      <Route path="/" element={<Navigate to={user ? '/profile/client' : '/login'} />} />
    </Routes>
  )
}

export default App