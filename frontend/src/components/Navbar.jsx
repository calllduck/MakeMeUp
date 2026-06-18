import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const navigate     = useNavigate()
  const location     = useLocation()
  const { user, logout } = useAuth()
  const [dropOpen, setDropOpen] = useState(false)
  const dropRef = useRef(null)

  // Tutup dropdown kalau klik di luar
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setDropOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const go = (path) => {
    setDropOpen(false)
    navigate(path)
  }

  const isHome = location.pathname === '/home/client' || location.pathname === '/'
  const isMuaPage = user?.role === 'mua'

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white/96 backdrop-blur-md border-b border-gray-100 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center gap-4">

        {/* Logo */}
        <button
          onClick={() => go(user ? (user.role === 'mua' ? '/dashboard/mua' : '/home/client') : '/')}
          className="flex items-center gap-2 shrink-0"
        >
          <div className="w-8 h-8 rounded-xl bg-[#f6339a] flex items-center justify-center shadow-sm">
            <span className="text-white font-black text-sm tracking-tighter">M</span>
          </div>
          <span className="font-black text-gray-900 text-lg tracking-tight hidden sm:block">
            MakeMeUp<span className="text-[#f6339a]">!</span>
          </span>
        </button>

        {/* Search pill — tampil di semua halaman kecuali home */}
        {!isHome && !isMuaPage && (
          <button
            onClick={() => go('/search')}
            className="hidden md:flex items-center gap-2 flex-1 max-w-xs bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full px-4 py-2 text-left transition-colors"
          >
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <span className="text-sm text-gray-400">Cari MUA…</span>
          </button>
        )}

        <div className="flex-1" />

        {user ? (
          <div className="flex items-center gap-1">
            {/* Tombol pesan */}
            <button
              onClick={() => go('/messages')}
              className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-[#f6339a] px-3 py-2 rounded-xl hover:bg-[#fdf2f8] transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
              </svg>
              Pesan
            </button>

            {/* Dropdown user */}
            <div className="relative" ref={dropRef}>
              <button
                onClick={() => setDropOpen(v => !v)}
                className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-[#f6339a] px-3 py-2 rounded-xl hover:bg-[#fdf2f8] transition-all"
              >
                <div className="w-7 h-7 rounded-full bg-[#f6339a] flex items-center justify-center text-white text-xs font-black">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:block">{user.name.split(' ')[0]}</span>
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7"/>
                </svg>
              </button>

              {dropOpen && (
                <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                  {/* Info user */}
                  <div className="px-4 py-2 border-b border-gray-50 mb-1">
                    <p className="text-xs text-gray-400">Masuk sebagai</p>
                    <p className="text-sm font-bold text-gray-900">{user.name}</p>
                    <p className="text-xs text-[#f6339a] capitalize font-medium">{user.role}</p>
                  </div>

                  {/* Dashboard */}
                  <button
                    onClick={() => go(user.role === 'mua' ? '/dashboard/mua' : '/dashboard/client')}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-[#fdf2f8] hover:text-[#f6339a] transition-colors font-medium"
                  >
                    {user.role === 'mua' ? '🎨 Dashboard MUA' : '📋 Dashboard Saya'}
                  </button>

                  {/* Pesan — mobile only */}
                  <button
                    onClick={() => go('/messages')}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-[#fdf2f8] hover:text-[#f6339a] transition-colors font-medium sm:hidden"
                  >
                    💬 Pesan
                  </button>

                  {/* Search — mobile only */}
                  <button
                    onClick={() => go('/search')}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-[#fdf2f8] hover:text-[#f6339a] transition-colors font-medium sm:hidden"
                  >
                    🔍 Cari MUA
                  </button>

                  {/* Logout */}
                  <div className="border-t border-gray-50 mt-1 pt-1">
                    <button
                      onClick={() => { logout(); go('/') }}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors font-medium"
                    >
                      Keluar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => go('/login')}
              className="text-sm font-semibold text-gray-700 hover:text-[#f6339a] px-4 py-2 rounded-xl hover:bg-[#fdf2f8] transition-all"
            >
              Masuk
            </button>
            <button
              onClick={() => go('/register')}
              className="text-sm font-bold text-white bg-[#f6339a] hover:bg-[#e01f87] px-5 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all"
            >
              Daftar
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar