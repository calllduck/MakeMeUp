import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchAPI } from '../services/api'

const SearchPage = () => {
  const navigate = useNavigate()
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({
    location: '',
    style: '',
    specialization: '',
    minPrice: '',
    maxPrice: '',
    minRating: '',
    date: ''
  })

  const handleSearch = async (e) => {
    e?.preventDefault()
    setLoading(true)
    setError('')
    try {
      // Hapus filter yang kosong sebelum dikirim
      const activeFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '')
      )
      const res = await searchAPI.searchMUA(activeFilters)
      setResults(res.data.data)
    } catch (err) {
      setError('Gagal memuat data MUA')
    } finally {
      setLoading(false)
    }
  }

  // Load semua MUA saat halaman pertama dibuka
  useEffect(() => { handleSearch() }, [])

  const handleReset = () => {
    setFilters({ location: '', style: '', specialization: '', minPrice: '', maxPrice: '', minRating: '', date: '' })
  }

  const getCompatibilityBadge = (mua) => {
    if (!mua.skinCompatibility) return null
    if (mua.skinCompatibility === 'compatible') {
      return <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full">✓ Skin Compatible</span>
    }
    if (mua.skinCompatibility === 'conflict') {
      return <span className="text-xs bg-yellow-50 text-yellow-600 px-2 py-0.5 rounded-full">⚠ Cek Bahan</span>
    }
    if (mua.skinCompatibility === 'incomplete_profile') {
      return <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Lengkapi profil kulitmu</span>
    }
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Cari Make Up Artist</h1>

        {/* Form Filter */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <form onSubmit={handleSearch} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input className="border rounded-lg p-2 text-sm" placeholder="Lokasi (contoh: Jakarta)" value={filters.location} onChange={e => setFilters({...filters, location: e.target.value})} />
              <input className="border rounded-lg p-2 text-sm" placeholder="Style (contoh: Korean, Glam)" value={filters.style} onChange={e => setFilters({...filters, style: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input className="border rounded-lg p-2 text-sm" placeholder="Spesialisasi (contoh: Bridal, Wisuda)" value={filters.specialization} onChange={e => setFilters({...filters, specialization: e.target.value})} />
              <input className="border rounded-lg p-2 text-sm" placeholder="Rating minimum (1-5)" type="number" min="1" max="5" value={filters.minRating} onChange={e => setFilters({...filters, minRating: e.target.value})} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <input className="border rounded-lg p-2 text-sm" placeholder="Harga min (Rp)" type="number" value={filters.minPrice} onChange={e => setFilters({...filters, minPrice: e.target.value})} />
              <input className="border rounded-lg p-2 text-sm" placeholder="Harga maks (Rp)" type="number" value={filters.maxPrice} onChange={e => setFilters({...filters, maxPrice: e.target.value})} />
              <input className="border rounded-lg p-2 text-sm" type="date" value={filters.date} onChange={e => setFilters({...filters, date: e.target.value})} />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-pink-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-pink-600 transition">Cari MUA</button>
              <button type="button" onClick={handleReset} className="px-4 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition">Reset Filter</button>
            </div>
          </form>
        </div>

        {/* Hasil Pencarian */}
        {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4">{error}</div>}

        {loading ? (
          <p className="text-center text-gray-400">Mencari MUA...</p>
        ) : results.length === 0 ? (
          <p className="text-center text-gray-400">Tidak ada MUA yang ditemukan</p>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">{results.length} MUA ditemukan</p>
            {results.map(mua => (
              <div
                key={mua.id}
                onClick={() => navigate(`/mua/${mua.id}`)}
                className="bg-white rounded-xl shadow p-5 flex gap-4 cursor-pointer hover:shadow-md transition"
              >
                {/* Avatar */}
                <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
                  {mua.avatarUrl ? (
                    <img src={mua.avatarUrl} alt={mua.brandName} className="w-16 h-16 rounded-full object-cover" />
                  ) : (
                    <span className="text-pink-400 text-xl font-bold">{mua.brandName?.charAt(0)}</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-gray-800">{mua.brandName}</p>
                      <p className="text-sm text-gray-500">{mua.operationalLocation}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-medium text-yellow-500">★ {parseFloat(mua.ratingAvg).toFixed(1)}</p>
                      <p className="text-xs text-gray-400">{mua.reviewCount} ulasan</p>
                    </div>
                  </div>

                  {/* Harga mulai dari */}
                  {mua.servicePackages?.length > 0 && (
                    <p className="text-sm text-pink-600 font-medium mt-1">
                      Mulai Rp {parseInt(mua.servicePackages[0].basePrice).toLocaleString('id-ID')}
                    </p>
                  )}

                  {/* Style & Spesialisasi */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {mua.specializations?.slice(0, 3).map((s, i) => (
                      <span key={i} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{s}</span>
                    ))}
                    {mua.makeupStyles?.slice(0, 2).map((s, i) => (
                      <span key={i} className="bg-pink-50 text-pink-500 text-xs px-2 py-0.5 rounded-full">{s}</span>
                    ))}
                  </div>

                  {/* Skin compatibility badge */}
                  <div className="mt-2">
                    {getCompatibilityBadge(mua)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchPage