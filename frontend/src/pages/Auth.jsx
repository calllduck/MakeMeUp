import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../services/api'

const Auth = ({ mode = 'login' }) => {
  const { login } = useAuth()
  const navigate  = useNavigate()

  const [tab, setTab]         = useState(mode) // 'login' atau 'register'
  const [role, setRole]       = useState('client')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  // State form login
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })

  // State form register
  const [regForm, setRegForm] = useState({
    name: '', email: '', password: '', phone: ''
  })

  // ── Handle Login ──
  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')

    if (!loginForm.email || !loginForm.password) {
      return setError('Email dan password wajib diisi.')
    }

    setLoading(true)
    try {
      // Kirim request ke POST /api/auth/login
      const res = await authAPI.login({
        email:    loginForm.email,
        password: loginForm.password,
      })

      // Backend return: { success: true, data: { token, user } }
      const { token, user } = res.data.data

      // Simpan ke AuthContext + localStorage
      login(token, user)

      // Redirect sesuai role
      navigate(user.role === 'mua' ? '/dashboard/mua' : '/home/client')

    } catch (err) {
      // Ambil pesan error dari backend, atau fallback ke pesan umum
      setError(err.response?.data?.message || 'Terjadi kesalahan, coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  // ── Handle Register ──
  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')

    if (!regForm.name || !regForm.email || !regForm.password || !regForm.phone) {
      return setError('Semua field wajib diisi.')
    }
    if (regForm.password.length < 8) {
      return setError('Password minimal 8 karakter.')
    }

    setLoading(true)
    try {
      // Kirim request ke POST /api/auth/register
      await authAPI.register({
        name:     regForm.name,
        email:    regForm.email,
        password: regForm.password,
        phone:    regForm.phone,
        role,
      })

      // Register berhasil → langsung login otomatis
      const res = await authAPI.login({
        email:    regForm.email,
        password: regForm.password,
      })

      const { token, user } = res.data.data
      login(token, user)
      navigate(user.role === 'mua' ? '/dashboard/mua' : '/home/client')

    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan, coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pt-16 min-h-screen bg-gradient-to-br from-white via-pink-50 to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <button onClick={() => navigate('/')} className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-[#f6339a] flex items-center justify-center shadow-md">
              <span className="text-white font-black text-base">M</span>
            </div>
            <span className="font-black text-xl text-gray-900">MakeMeUp!</span>
          </button>
          <h1 className="text-2xl font-black text-gray-900">
            {tab === 'login' ? 'Selamat datang kembali 👋' : 'Buat akun baru ✨'}
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {tab === 'login' ? 'Masuk ke akun MakeMeUp! kamu' : 'Bergabung sebagai klien atau MUA'}
          </p>
        </div>

        {/* Tab Login / Register */}
        <div className="flex bg-gray-100 rounded-2xl p-1 mb-6">
          <button
            onClick={() => { setTab('login'); setError('') }}
            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
              tab === 'login' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'
            }`}
          >
            Masuk
          </button>
          <button
            onClick={() => { setTab('register'); setError('') }}
            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
              tab === 'register' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'
            }`}
          >
            Daftar
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">

          {/* Pesan error */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm font-medium px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {/* ── Form Login ── */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <InputField
                label="Email"
                type="email"
                value={loginForm.email}
                onChange={v => setLoginForm(f => ({ ...f, email: v }))}
                placeholder="email@kamu.com"
              />
              <InputField
                label="Password"
                type="password"
                value={loginForm.password}
                onChange={v => setLoginForm(f => ({ ...f, password: v }))}
                placeholder="Minimal 8 karakter"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#f6339a] hover:bg-[#e01f87] disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors mt-2"
              >
                {loading ? 'Memuat...' : 'Masuk'}
              </button>
            </form>
          )}

          {/* ── Form Register ── */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">

              {/* Pilih role */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                  Daftar sebagai
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'client', label: '💄 Klien',        desc: 'Cari & booking MUA' },
                    { value: 'mua',    label: '🎨 Make Up Artist', desc: 'Tawarkan jasa makeup' },
                  ].map(r => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setRole(r.value)}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        role === r.value
                          ? 'border-[#f6339a] bg-pink-50'
                          : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <div className={`text-sm font-bold ${role === r.value ? 'text-[#f6339a]' : 'text-gray-700'}`}>
                        {r.label}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">{r.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <InputField
                label="Nama Lengkap"
                value={regForm.name}
                onChange={v => setRegForm(f => ({ ...f, name: v }))}
                placeholder="Nama kamu"
              />
              <InputField
                label="Email"
                type="email"
                value={regForm.email}
                onChange={v => setRegForm(f => ({ ...f, email: v }))}
                placeholder="email@kamu.com"
              />
              <InputField
                label="Nomor HP"
                type="tel"
                value={regForm.phone}
                onChange={v => setRegForm(f => ({ ...f, phone: v }))}
                placeholder="08xxxxxxxxxx"
              />
              <InputField
                label="Password"
                type="password"
                value={regForm.password}
                onChange={v => setRegForm(f => ({ ...f, password: v }))}
                placeholder="Minimal 8 karakter"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#f6339a] hover:bg-[#e01f87] disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors mt-2"
              >
                {loading ? 'Memuat...' : 'Buat Akun'}
              </button>
            </form>
          )}

        </div>

        {/* Link bawah */}
        <p className="text-center text-sm text-gray-400 mt-4">
          {tab === 'login' ? 'Belum punya akun? ' : 'Sudah punya akun? '}
          <button
            onClick={() => { setTab(tab === 'login' ? 'register' : 'login'); setError('') }}
            className="text-[#f6339a] font-semibold hover:underline"
          >
            {tab === 'login' ? 'Daftar sekarang' : 'Masuk'}
          </button>
        </p>

      </div>
    </div>
  )
}

// Komponen input yang reusable — supaya tidak perlu tulis ulang styling berkali-kali
const InputField = ({ label, type = 'text', value, onChange, placeholder }) => (
  <div>
    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-gray-50 border border-gray-200 focus:border-[#f6339a] rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
    />
  </div>
)

export default Auth