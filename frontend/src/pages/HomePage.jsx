import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function HomePage() {
  const navigate = useNavigate()
  const [keyword, setKeyword] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    navigate(`/search?keyword=${keyword}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero section */}
      <div className="bg-gradient-to-br from-pink-50 to-white py-20 px-4 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-3">
          Temukan <span className="text-pink-500">MUA</span> Terbaikmu
        </h1>
        <p className="text-gray-500 mb-8 text-lg">
          Booking makeup artist profesional sesuai style dan jenis kulitmu
        </p>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="max-w-lg mx-auto flex gap-2">
          <input
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            placeholder="Cari MUA atau spesialisasi..."
            className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
          />
          <button
            type="submit"
            className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-xl text-sm font-semibold transition"
          >
            Cari
          </button>
        </form>
      </div>

      {/* CTA section */}
      <div className="max-w-5xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: '🔍', title: 'Cari MUA', desc: 'Filter berdasarkan style, lokasi, dan harga' },
          { icon: '📅', title: 'Booking Mudah', desc: 'Pilih jadwal dan paket layanan langsung' },
          { icon: '✨', title: 'Kulit Aman', desc: 'Cek kompatibilitas skinprep sebelum booking' },
        ].map(item => (
          <div key={item.title} className="bg-white rounded-2xl p-6 shadow-sm text-center">
            <div className="text-4xl mb-3">{item.icon}</div>
            <h3 className="font-semibold text-gray-800 mb-1">{item.title}</h3>
            <p className="text-sm text-gray-500">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Tombol browse semua MUA */}
      <div className="text-center pb-16">
        <button
          onClick={() => navigate('/search')}
          className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-xl font-semibold transition"
        >
          Lihat Semua MUA
        </button>
      </div>
    </div>
  )
}