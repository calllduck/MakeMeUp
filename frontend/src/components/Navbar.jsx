import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const clientLinks = [
  { to: '/', label: 'Home' },
  { to: '/bookings', label: 'My Bookings' },
  { to: '/inbox', label: 'Inbox' },
  { to: '/profile/client', label: 'Profile' },
]

const muaLinks = [
  { to: '/', label: 'Home' },
  { to: '/mua/bookings', label: 'List Booking' },
  { to: '/inbox', label: 'Inbox' },
  { to: '/profile/mua', label: 'Profile' },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  if (!user) return null

  const links = user.role === 'mua' ? muaLinks : clientLinks

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="text-pink-500 font-bold text-xl tracking-tight">
          MakeMeUp!
        </Link>

        {/* Desktop menu */}
        <div className="hidden md:flex items-center gap-6">
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm font-medium transition ${
                location.pathname === link.to
                  ? 'text-pink-500'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-gray-500 hover:text-red-500 transition"
          >
            Logout
          </button>
        </div>

        {/* Mobile burger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex flex-col gap-1.5 p-2"
        >
          <span className={`block w-5 h-0.5 bg-gray-600 transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-5 h-0.5 bg-gray-600 transition-all ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-5 h-0.5 bg-gray-600 transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-1">
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className={`block py-2 text-sm font-medium transition ${
                location.pathname === link.to
                  ? 'text-pink-500'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="block w-full text-left py-2 text-sm font-medium text-gray-500 hover:text-red-500 transition"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  )
}