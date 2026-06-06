import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { searchAPI } from '../services/api'

const MuaDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [mua, setMua] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await searchAPI.getMuaDetail(id)
        setMua(res.data.data)
      } catch (err) {
        setError('MUA tidak ditemukan')
      } finally {
        setLoading(false)
      }
    }
    fetchDetail()
  }, [id])

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-400">Memuat...</p></div>
  if (error) return <div className="min-h-screen flex items-center justify-center"><p className="text-red-400">{error}</p></div>

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Tombol kembali */}
        <button onClick={() => navigate('/search')} className="text-sm text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1">
          ← Kembali ke pencarian
        </button>

        {/* Header Profil */}
        <div className="bg-white rounded-xl shadow p-6 mb-4">
          <div className="flex gap-4 items-start">
            <div className="w-20 h-20 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
              {mua.avatarUrl ? (
                <img src={mua.avatarUrl} alt={mua.brandName} className="w-20 h-20 rounded-full object-cover" />
              ) : (
                <span className="text-pink-400 text-2xl font-bold">{mua.brandName?.charAt(0)}</span>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-800">{mua.brandName}</h1>
              <p className="text-gray-500 text-sm">{mua.operationalLocation}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-yellow-500 font-medium">★ {parseFloat(mua.ratingAvg).toFixed(1)}</span>
                <span className="text-gray-400 text-sm">({mua.reviewCount} ulasan)</span>
                {mua.yearsExperience && <span className="text-gray-400 text-sm">· {mua.yearsExperience} tahun pengalaman</span>}
              </div>
              {mua.bio && <p className="text-gray-600 text-sm mt-2">{mua.bio}</p>}
            </div>
          </div>

          {/* Skin Compatibility Warning */}
          {mua.skinCompatibility === 'conflict' && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-yellow-700 text-sm font-medium">⚠ Potensi konflik bahan skinprep</p>
              <p className="text-yellow-600 text-sm mt-1">Bahan berikut ada di daftar sensitifmu: <strong>{mua.conflictIngredients.join(', ')}</strong></p>
            </div>
          )}
          {mua.skinCompatibility === 'compatible' && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-green-700 text-sm">✓ Skinprep MUA ini kompatibel dengan profil kulitmu</p>
            </div>
          )}
          {mua.skinCompatibility === 'incomplete_profile' && (
            <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-gray-600 text-sm">Lengkapi <a href="/profile/client" className="text-pink-500 underline">profil kulitmu</a> untuk cek kompatibilitas skinprep</p>
            </div>
          )}
        </div>

        {/* Spesialisasi & Style */}
        <div className="bg-white rounded-xl shadow p-6 mb-4">
          <h2 className="font-semibold text-gray-700 mb-3">Spesialisasi & Style</h2>
          <div className="flex flex-wrap gap-2">
            {mua.specializations?.map((s, i) => (
              <span key={i} className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full">{s}</span>
            ))}
            {mua.makeupStyles?.map((s, i) => (
              <span key={i} className="bg-pink-50 text-pink-600 text-sm px-3 py-1 rounded-full">{s}</span>
            ))}
          </div>
        </div>

        {/* Paket Layanan */}
        <div className="bg-white rounded-xl shadow p-6 mb-4">
          <h2 className="font-semibold text-gray-700 mb-3">Paket Layanan</h2>
          {mua.servicePackages?.length === 0 ? (
            <p className="text-gray-400 text-sm">Belum ada paket tersedia</p>
          ) : (
            <div className="space-y-3">
              {mua.servicePackages?.map(pkg => (
                <div key={pkg.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <p className="font-medium text-gray-800">{pkg.name}</p>
                    <p className="text-pink-600 font-semibold">Rp {parseInt(pkg.basePrice).toLocaleString('id-ID')}</p>
                  </div>
                  {pkg.description && <p className="text-gray-500 text-sm mt-1">{pkg.description}</p>}
                  <p className="text-gray-400 text-xs mt-1">⏱ {pkg.durationMinutes} menit</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {pkg.includedServices?.map((s, i) => (
                      <span key={i} className="bg-pink-50 text-pink-600 text-xs px-2 py-0.5 rounded-full">{s}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add-on */}
        {mua.packageAddons?.length > 0 && (
          <div className="bg-white rounded-xl shadow p-6 mb-4">
            <h2 className="font-semibold text-gray-700 mb-3">Add-on Tersedia</h2>
            <div className="space-y-2">
              {mua.packageAddons.map(addon => (
                <div key={addon.id} className="flex justify-between items-center border rounded-lg p-3">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{addon.name}</p>
                    {addon.description && <p className="text-xs text-gray-500">{addon.description}</p>}
                  </div>
                  <p className="text-pink-600 text-sm font-medium">+Rp {parseInt(addon.price).toLocaleString('id-ID')}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Jadwal Tersedia */}
        <div className="bg-white rounded-xl shadow p-6 mb-4">
          <h2 className="font-semibold text-gray-700 mb-3">Jadwal Tersedia</h2>
          {mua.schedules?.length === 0 ? (
            <p className="text-gray-400 text-sm">Tidak ada jadwal tersedia</p>
          ) : (
            <div className="space-y-2">
              {mua.schedules?.map(s => (
                <div key={s.id} className="flex justify-between items-center border rounded-lg p-3">
                  <p className="text-sm text-gray-700">
                    {new Date(s.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  <p className="text-sm text-gray-500">{s.startTime} – {s.endTime}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Skinprep */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="font-semibold text-gray-700 mb-3">Informasi Skinprep</h2>
          <div className="space-y-1 text-sm text-gray-600">
            {mua.canUseOwnSkinprep && <p>✓ Bisa menggunakan skinprep milik MUA</p>}
            {mua.canUseClientSkinprep && <p>✓ Bisa menggunakan skinprep milik klien</p>}
            {mua.ownSkinprepIngredients?.length > 0 && (
              <div className="mt-2">
                <p className="text-gray-500 text-xs mb-1">Bahan utama skinprep MUA:</p>
                <div className="flex flex-wrap gap-1">
                  {mua.ownSkinprepIngredients.map((ing, i) => (
                    <span key={i} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{ing}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tombol Booking */}
        <button
          onClick={() => navigate(`/booking/${mua.id}`)}
          className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 rounded-xl transition"
        >
          Booking Sekarang
        </button>

        <button
          onClick={() => navigate(`/messages/${mua.id}?otherUserId=${mua.userId}`)}
          className="w-full border border-pink-500 text-pink-500 hover:bg-pink-50 font-semibold py-3 rounded-2xl transition"
        >
          Kirim Pesan
        </button>

      </div>
    </div>
  )
}

export default MuaDetailPage