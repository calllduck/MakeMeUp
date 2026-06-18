import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { searchAPI } from '../services/api'

const FEATURED_MUAS = [
  { id:1, brandName:'Bella Beauty Studio',  operationalLocation:'Jakarta Selatan', ratingAvg:4.9, reviewCount:127, specializations:['Bridal','Glam','Editorial'],   minPrice:500000,  skinCompatibility:'compatible', isVerified:true  },
  { id:2, brandName:'Sari Maharani MUA',    operationalLocation:'Bandung',         ratingAvg:4.7, reviewCount:89,  specializations:['Korean','Natural','Bridal'],    minPrice:350000,  skinCompatibility:null,         isVerified:true  },
  { id:3, brandName:'Diana Artistry',       operationalLocation:'Surabaya',        ratingAvg:4.8, reviewCount:203, specializations:['Editorial','Theatrical','Glam'],minPrice:800000,  skinCompatibility:'warning',    isVerified:false },
  { id:4, brandName:'Citra Beauty House',   operationalLocation:'Jakarta Pusat',   ratingAvg:5.0, reviewCount:312, specializations:['Bridal','Airbrush','Glam'],     minPrice:1200000, skinCompatibility:'compatible', isVerified:true  },
]

const STEPS = [
  { icon:'🔍', title:'Cari & Filter MUA',  desc:'Temukan MUA yang cocok berdasarkan style, budget, lokasi, dan profil kulitmu dengan filter cerdas kami.' },
  { icon:'📅', title:'Pilih Paket & Book', desc:'Cek jadwal real-time, pilih paket dan add-on sesuai kebutuhan, lalu konfirmasi booking dalam beberapa klik.' },
  { icon:'💄', title:'Sesi & Review',      desc:'Nikmati sesi makeupmu, lalu berikan ulasan terverifikasi untuk membantu sesama klien menemukan MUA terbaik.' },
]

const MINI_CARDS = [
  { initial:'B', name:'Bella Beauty',   loc:'Jakarta',  rating:'4.9', grad:'from-pink-100 to-rose-100'   },
  { initial:'C', name:'Citra Artistry', loc:'Bali',     rating:'5.0', grad:'from-fuchsia-50 to-pink-100' },
  { initial:'S', name:'Sari MUA',       loc:'Bandung',  rating:'4.7', grad:'from-purple-50 to-pink-50'   },
  { initial:'D', name:'Diana Studio',   loc:'Surabaya', rating:'4.8', grad:'from-rose-50 to-pink-100'    },
]

const formatIDR = (amount) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount)

const ClientHome = () => {
  const navigate    = useNavigate()
  const { user, logout } = useAuth()
  const [loc, setLoc]     = useState('')
  const [style, setStyle] = useState('')
  const [realMuas, setRealMuas] = useState([])

  // Fetch MUA dari backend untuk section Featured
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await searchAPI.searchMUA({})
        setRealMuas(res.data.data.slice(0, 4))
      } catch { }
    }
    fetch()
  }, [])

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (loc)   params.set('location', loc)
    if (style) params.set('style', style)
    navigate(`/search?${params.toString()}`)
  }

  // Gunakan data real kalau ada, fallback ke dummy
  const featuredMuas = realMuas.length > 0 ? realMuas : FEATURED_MUAS

  return (
    <div className="pt-16">

      {/* ── Hero ── */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-white">
        {/* Decorative blobs */}
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-[#f6339a]/[0.06] blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 -left-20 w-80 h-80 rounded-full bg-[#f6339a]/[0.05] blur-2xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 w-full grid lg:grid-cols-2 gap-16 items-center">

          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 bg-[#fdf2f8] text-[#f6339a] px-4 py-1.5 rounded-full text-sm font-semibold mb-6 border border-[#f6339a]/20">
              ✨ Platform booking MUA #1 di Indonesia
            </div>
            <h1 className="text-5xl sm:text-6xl font-black text-gray-900 leading-[1.1] tracking-tight">
              Temukan MUA<br />
              <span className="text-[#f6339a]">Impianmu.</span>
            </h1>
            <p className="mt-6 text-lg text-gray-500 leading-relaxed max-w-md">
              Platform pertama yang menghubungkan kamu dengan Make Up Artist profesional sesuai style, budget, dan profil kulitmu — tanpa ribet.
            </p>

            {/* Search bar */}
            <div className="mt-8 bg-white rounded-2xl shadow-lg border border-gray-100 p-2 flex flex-col sm:flex-row gap-2">
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-3 flex-1">
                <svg className="w-4 h-4 text-[#f6339a] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <input
                  value={loc}
                  onChange={e => setLoc(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  placeholder="Kota atau lokasi"
                  className="bg-transparent flex-1 outline-none text-sm text-gray-700 placeholder-gray-400"
                />
              </div>
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-3 flex-1">
                <svg className="w-4 h-4 text-[#f6339a] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
                </svg>
                <select
                  value={style}
                  onChange={e => setStyle(e.target.value)}
                  className="bg-transparent flex-1 outline-none text-sm text-gray-700"
                >
                  <option value="">Semua Style</option>
                  {['Natural','Bridal','Glam','Korean','Editorial','Theatrical','Airbrush','SFX'].map(s => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleSearch}
                className="bg-[#f6339a] hover:bg-[#e01f87] active:bg-[#c91a74] text-white font-bold px-6 py-3 rounded-xl transition-colors whitespace-nowrap"
              >
                Cari MUA
              </button>
            </div>

            {/* Stats */}
            <div className="mt-8 flex items-center gap-8">
              {[['2,400+','MUA Terdaftar'],['50rb+','Booking Berhasil'],['4.9★','Rating Rata-rata']].map(([v, l]) => (
                <div key={l}>
                  <div className="text-2xl font-black text-gray-900">{v}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right – floating MUA cards */}
          <div className="hidden lg:grid grid-cols-2 gap-4 relative">
            {MINI_CARDS.map((c, i) => (
              <div key={i} className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden`}>
                <div className={`h-28 bg-gradient-to-br ${c.grad} flex items-center justify-center`}>
                  <div className="w-14 h-14 rounded-full bg-white/70 backdrop-blur-sm flex items-center justify-center text-[#f6339a] text-2xl font-black">
                    {c.initial}
                  </div>
                </div>
                <div className="p-3">
                  <div className="font-bold text-sm text-gray-900">{c.name}</div>
                  <div className="text-xs text-gray-400">{c.loc}</div>
                  <div className="text-yellow-400 text-xs mt-1">{'★'.repeat(5)} <span className="text-gray-500">{c.rating}</span></div>
                </div>
              </div>
            ))}
            {/* Skin compat floating badge */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-xl border border-gray-100 px-4 py-3 flex items-center gap-3 whitespace-nowrap">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-base">✓</div>
              <div>
                <div className="text-xs font-bold text-gray-900">Cocok untuk kulitmu</div>
                <div className="text-xs text-gray-400">Berdasarkan profil kulitmu</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-24 bg-[#fafafa]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900">Cara Kerjanya Mudah</h2>
            <p className="mt-3 text-gray-400 text-lg">Book MUA impianmu dalam 3 langkah</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 relative">
            {STEPS.map((s, i) => (
              <div key={i} className="relative text-center">
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[40%] h-px bg-gradient-to-r from-[#f6339a]/30 to-transparent" />
                )}
                <div className="w-16 h-16 rounded-2xl bg-white border border-[#f6339a]/15 shadow-sm flex items-center justify-center text-3xl mx-auto">
                  {s.icon}
                </div>
                <div className="mt-4 text-xs font-bold text-[#f6339a] uppercase tracking-widest">Langkah {i + 1}</div>
                <h3 className="mt-1.5 text-lg font-bold text-gray-900">{s.title}</h3>
                <p className="mt-2 text-sm text-gray-400 leading-relaxed max-w-xs mx-auto">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured MUAs ── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900">MUA Terpopuler</h2>
              <p className="mt-1 text-gray-400">Dipercaya ribuan klien di seluruh Indonesia</p>
            </div>
            <button
              onClick={() => navigate('/search')}
              className="text-[#f6339a] font-bold text-sm hover:underline hidden sm:block"
            >
              Lihat semua →
            </button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredMuas.map((m, i) => (
              <MuaCard key={m.id || i} mua={m} navigate={navigate} />
            ))}
          </div>
          <div className="mt-8 flex sm:hidden justify-center">
            <button
              onClick={() => navigate('/search')}
              className="text-[#f6339a] font-bold text-sm border border-[#f6339a]/30 px-6 py-2.5 rounded-full hover:bg-[#fdf2f8] transition-colors"
            >
              Lihat semua MUA →
            </button>
          </div>
        </div>
      </section>

      {/* ── MUA CTA ── */}
      <section className="py-24 bg-[#f6339a] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/30 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white/20 blur-2xl" />
        </div>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center relative">
          <h2 className="text-3xl sm:text-4xl font-black text-white">Kamu seorang MUA? 💄</h2>
          <p className="mt-4 text-white/80 text-lg leading-relaxed">
            Bergabung dengan 2,400+ MUA profesional. Kelola jadwal, paket layanan, dan klienmu dari satu platform — gratis untuk mulai.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => { logout(); navigate('/register') }}
              className="bg-white text-[#f6339a] font-bold px-8 py-4 rounded-full hover:bg-gray-50 transition-colors shadow-lg"
            >
              Daftar sebagai MUA
            </button>
            <button
              onClick={() => navigate('/search')}
              className="text-white border border-white/30 font-semibold px-8 py-4 rounded-full hover:bg-white/10 transition-colors"
            >
              Lihat Cara Kerjanya
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-900 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#f6339a] flex items-center justify-center">
              <span className="text-white font-black text-xs">M</span>
            </div>
            <span className="text-white font-black">MakeMeUp<span className="text-[#f6339a]">!</span></span>
          </div>
          <p className="text-gray-500 text-sm">© 2025 MakeMeUp! — Where Beauty Meets Artist</p>
          <div className="flex gap-4 text-sm text-gray-500">
            <a href="#" className="hover:text-white transition-colors">Kebijakan Privasi</a>
            <a href="#" className="hover:text-white transition-colors">Syarat & Ketentuan</a>
          </div>
        </div>
      </footer>

    </div>
  )
}

// ── MUA Card ──
const MuaCard = ({ mua, navigate }) => {
  const cheapest = mua.servicePackages?.length > 0
    ? Math.min(...mua.servicePackages.map(p => Number(p.basePrice)))
    : mua.minPrice || null

  return (
    <div
      onClick={() => navigate(`/mua/${mua.id}`)}
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
    >
      {/* Avatar area */}
      <div className="h-36 bg-gradient-to-br from-pink-50 to-rose-100 flex items-center justify-center relative">
        <div className="w-16 h-16 rounded-2xl bg-white/70 backdrop-blur-sm flex items-center justify-center text-[#f6339a] text-3xl font-black shadow-sm">
          {mua.brandName?.charAt(0)}
        </div>
        {mua.isVerified && (
          <div className="absolute top-3 right-3 bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            ✓
          </div>
        )}
        {mua.skinCompatibility === 'compatible' && (
          <div className="absolute bottom-3 left-3 bg-green-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
            ✓ Cocok kulitmu
          </div>
        )}
        {mua.skinCompatibility === 'warning' && (
          <div className="absolute bottom-3 left-3 bg-amber-400 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
            ⚠ Cek Kandungan
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-bold text-gray-900 text-sm">{mua.brandName}</h3>
        <p className="text-xs text-gray-400 mt-0.5">📍 {mua.operationalLocation}</p>
        <div className="flex items-center gap-1 mt-1.5">
          <span className="text-yellow-400 text-xs">★</span>
          <span className="text-xs font-semibold text-gray-700">{Number(mua.ratingAvg).toFixed(1)}</span>
          <span className="text-xs text-gray-400">({mua.reviewCount})</span>
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {mua.specializations?.slice(0, 2).map(s => (
            <span key={s} className="text-xs bg-pink-50 text-[#f6339a] px-2 py-0.5 rounded-full font-medium">{s}</span>
          ))}
        </div>
        {cheapest && (
          <p className="mt-3 text-sm font-black text-[#f6339a]">
            mulai {formatIDR(cheapest)}
          </p>
        )}
      </div>
    </div>
  )
}

export default ClientHome