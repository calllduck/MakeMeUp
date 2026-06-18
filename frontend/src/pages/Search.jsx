import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchAPI } from '../services/api'

const Search = () => {
  const navigate = useNavigate()

  const [results, setResults]   = useState([])
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  // State filter
  const [filters, setFilters] = useState({
    location:       '',
    style:          '',
    specialization: '',
    minPrice:       '',
    maxPrice:       '',
    minRating:      '',
    date:           '',
    skinprep:       '',
  })

  // Jalankan search saat pertama buka halaman (tanpa filter)
  useEffect(() => {
    doSearch()
  }, [])

  const doSearch = async (f = filters) => {
    setLoading(true)
    setError('')
    try {
      // Kirim hanya filter yang terisi — filter kosong tidak dikirim
      const params = Object.fromEntries(
        Object.entries(f).filter(([_, v]) => v !== '')
      )
      const res = await searchAPI.searchMUA(params)
      setResults(res.data.data)
    } catch (err) {
      setError('Gagal memuat data MUA. Pastikan backend sedang berjalan.')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(f => ({ ...f, [key]: value }))
  }

  const handleReset = () => {
    const empty = Object.fromEntries(Object.keys(filters).map(k => [k, '']))
    setFilters(empty)
    doSearch(empty)
  }

  return (
    <div className="pt-16 min-h-screen bg-[#fafafa]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-black text-gray-900">Cari Make Up Artist 💄</h1>
          <p className="text-gray-400 text-sm mt-1">Temukan MUA yang cocok untuk kamu</p>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">

            <FilterInput
              placeholder="Lokasi (contoh: Jakarta)"
              value={filters.location}
              onChange={v => handleFilterChange('location', v)}
            />
            <FilterInput
              placeholder="Style (contoh: Bridal)"
              value={filters.style}
              onChange={v => handleFilterChange('style', v)}
            />
            <FilterInput
              placeholder="Spesialisasi (contoh: Wisuda)"
              value={filters.specialization}
              onChange={v => handleFilterChange('specialization', v)}
            />
            <FilterInput
              placeholder="Harga min (contoh: 500000)"
              value={filters.minPrice}
              onChange={v => handleFilterChange('minPrice', v)}
              type="number"
            />
            <FilterInput
              placeholder="Harga maks"
              value={filters.maxPrice}
              onChange={v => handleFilterChange('maxPrice', v)}
              type="number"
            />
            <FilterInput
              placeholder="Rating min (1-5)"
              value={filters.minRating}
              onChange={v => handleFilterChange('minRating', v)}
              type="number"
            />
            <FilterInput
              placeholder="Tanggal tersedia"
              value={filters.date}
              onChange={v => handleFilterChange('date', v)}
              type="date"
            />

            {/* Filter skinprep */}
            <select
              value={filters.skinprep}
              onChange={e => handleFilterChange('skinprep', e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-600 outline-none focus:border-[#f6339a] transition-all"
            >
              <option value="">Skinprep (semua)</option>
              <option value="own">MUA bawa skinprep sendiri</option>
              <option value="client">Bisa pakai skinprep klien</option>
            </select>

          </div>

          {/* Tombol */}
          <div className="flex gap-2">
            <button
              onClick={() => doSearch()}
              className="flex-1 bg-[#f6339a] hover:bg-[#e01f87] text-white font-bold py-2.5 rounded-xl text-sm transition-colors"
            >
              🔍 Cari MUA
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2.5 border border-gray-200 text-gray-500 font-semibold rounded-xl text-sm hover:bg-gray-50 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-16 text-gray-400">
            <div className="text-3xl mb-2">💄</div>
            <p className="text-sm">Mencari MUA...</p>
          </div>
        )}

        {/* Hasil */}
        {!loading && (
          <>
            <p className="text-sm text-gray-400 mb-4">
              {results.length} MUA ditemukan
            </p>
            {results.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <div className="text-4xl mb-3">🔍</div>
                <p className="font-semibold">Tidak ada MUA yang cocok</p>
                <p className="text-sm mt-1">Coba ubah filter pencarian kamu</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {results.map(mua => (
                  <MuaCard
                    key={mua.id}
                    mua={mua}
                    onClick={() => navigate(`/mua/${mua.id}`)}
                  />
                ))}
              </div>
            )}
          </>
        )}

      </div>
    </div>
  )
}

// ── MUA Card ──
const MuaCard = ({ mua, onClick }) => {
  const cheapest = mua.servicePackages?.length > 0
    ? Math.min(...mua.servicePackages.map(p => Number(p.basePrice)))
    : null

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl border border-gray-100 p-5 cursor-pointer hover:border-[#f6339a]/30 hover:shadow-sm transition-all"
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-100 to-rose-200 flex items-center justify-center text-[#f6339a] text-2xl font-black shrink-0">
          {mua.brandName?.charAt(0) || '?'}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-gray-900">{mua.brandName}</h3>
            {mua.isVerified && (
              <span className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                ✓ Verified
              </span>
            )}
          </div>

          <p className="text-xs text-gray-400 mt-0.5">
            📍 {mua.operationalLocation}
            {mua.yearsExperience ? ` · ${mua.yearsExperience} tahun` : ''}
          </p>

          {/* Rating */}
          <div className="flex items-center gap-1 mt-1">
            <span className="text-yellow-400 text-sm">★</span>
            <span className="text-sm font-semibold text-gray-700">
              {Number(mua.ratingAvg).toFixed(1)}
            </span>
            <span className="text-xs text-gray-400">({mua.reviewCount} review)</span>
          </div>

          {/* Style tags */}
          {mua.makeupStyles?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {mua.makeupStyles.slice(0, 3).map(s => (
                <span key={s} className="text-xs bg-pink-50 text-[#f6339a] px-2 py-0.5 rounded-full font-medium">
                  {s}
                </span>
              ))}
            </div>
          )}

          {/* Harga & skin compat */}
          <div className="flex items-center justify-between mt-3">
            {cheapest ? (
              <span className="text-sm font-black text-[#f6339a]">
                mulai {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(cheapest)}
              </span>
            ) : (
              <span className="text-xs text-gray-400">Harga belum diset</span>
            )}

            {/* Skin compatibility badge */}
            {mua.skinCompatibility === 'compatible' && (
              <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                ✓ Cocok kulitmu
              </span>
            )}
            {mua.skinCompatibility === 'conflict' && (
              <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                ⚠ Cek Kandungan
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Komponen filter input ──
const FilterInput = ({ placeholder, value, onChange, type = 'text' }) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={e => onChange(e.target.value)}
    className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#f6339a] transition-all w-full"
  />
)

export default Search