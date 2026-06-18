import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { searchAPI } from '../services/api'

const formatIDR = (amount) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount)

const MuaDetail = () => {
  const { id }       = useParams()
  const navigate     = useNavigate()
  const { user }     = useAuth()

  const [mua, setMua]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState('')
  const [tab, setTab]       = useState('porto')

  useEffect(() => {
    const fetchMua = async () => {
      try {
        const res = await searchAPI.getMuaDetail(id)
        setMua(res.data.data)
      } catch (err) {
        setError('MUA tidak ditemukan.')
      } finally {
        setLoading(false)
      }
    }
    fetchMua()
  }, [id])

  if (loading) return (
    <div className="pt-16 min-h-screen flex items-center justify-center text-gray-400">
      <div className="text-center">
        <div className="text-3xl mb-2">💄</div>
        <p className="text-sm">Memuat profil MUA...</p>
      </div>
    </div>
  )

  if (error || !mua) return (
    <div className="pt-16 min-h-screen flex items-center justify-center text-gray-400">
      <div className="text-center">
        <div className="text-4xl mb-3">😕</div>
        <p className="font-semibold">{error || 'MUA tidak ditemukan'}</p>
        <button onClick={() => navigate('/search')} className="mt-4 text-[#f6339a] font-semibold hover:underline text-sm">
          ← Kembali ke pencarian
        </button>
      </div>
    </div>
  )

  const cheapest = mua.servicePackages?.length > 0
    ? Math.min(...mua.servicePackages.map(p => Number(p.basePrice)))
    : null

  return (
    <div className="pt-16 bg-[#fafafa] min-h-screen">

      {/* Header profil */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row gap-6 items-start">

            {/* Avatar */}
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br from-pink-100 to-rose-200 flex items-center justify-center text-[#f6339a] text-5xl font-black shadow-sm shrink-0">
              {mua.brandName?.charAt(0)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900">{mua.brandName}</h1>
                {mua.isVerified && (
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                    ✓ Terverifikasi
                  </span>
                )}
              </div>

              <p className="text-gray-500 text-sm">
                📍 {mua.operationalLocation}
                {mua.yearsExperience ? ` · ${mua.yearsExperience} tahun pengalaman` : ''}
              </p>

              {/* Rating */}
              <div className="flex items-center gap-2 mt-2">
                <div className="flex">
                  {[1,2,3,4,5].map(i => (
                    <span key={i} className={`text-lg ${i <= Math.round(Number(mua.ratingAvg)) ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
                  ))}
                </div>
                <span className="text-sm font-bold text-gray-700">{Number(mua.ratingAvg).toFixed(1)}</span>
                <span className="text-sm text-gray-400">({mua.reviewCount} review)</span>
              </div>

              {/* Style tags */}
              {mua.makeupStyles?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {mua.makeupStyles.map(s => (
                    <span key={s} className="text-xs bg-pink-50 text-[#f6339a] border border-pink-100 px-2.5 py-1 rounded-full font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Tombol booking */}
            <div className="w-full sm:w-auto shrink-0">
              {cheapest && (
                <p className="text-xs text-gray-400 mb-1 text-right">mulai dari</p>
              )}
              {cheapest && (
                <p className="text-xl font-black text-[#f6339a] text-right mb-3">
                  {formatIDR(cheapest)}
                </p>
              )}
              <div className="flex gap-3">
                <button
                    onClick={() => {
                    if (!user) return navigate('/login')
                    navigate(`/messages/${mua.id}`)
                    }}
                    className="border border-gray-200 hover:border-[#f6339a] hover:text-[#f6339a] text-gray-600 font-bold px-6 py-3 rounded-xl transition-colors flex items-center gap-2"
                >
                    💬 Chat
                </button>
                <button
                    onClick={() => {
                    if (!user) return navigate('/login')
                    if (user.role !== 'client') return
                    navigate(`/booking/${mua.id}`)
                    }}
                    className="w-full sm:w-auto bg-[#f6339a] hover:bg-[#e01f87] text-white font-bold px-8 py-3 rounded-xl transition-colors"
                >
                    Booking Sekarang
                </button>
                </div>
            </div>
          </div>

          {/* Skin compatibility banner */}
          {mua.skinCompatibility === 'compatible' && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span className="text-sm font-semibold text-green-700">Cocok untuk profil kulitmu</span>
            </div>
          )}
          {mua.skinCompatibility === 'conflict' && (
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <p className="text-sm font-semibold text-amber-700">
                ⚠ Potensi konflik bahan skinprep
              </p>
              {mua.conflictIngredients?.length > 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  Bahan yang perlu dicek: {mua.conflictIngredients.join(', ')}
                </p>
              )}
            </div>
          )}
          {mua.skinCompatibility === 'incomplete_profile' && (
            <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-gray-500">Lengkapi profil kulit untuk cek kompatibilitas</span>
              <button onClick={() => navigate('/dashboard/client')} className="text-xs font-semibold text-[#f6339a] hover:underline">
                Lengkapi →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tab navigasi */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex gap-1 overflow-x-auto">
            {[
              ['porto',   '🖼 Portofolio'],
              ['packages','📦 Paket & Harga'],
              ['schedule','📅 Jadwal'],
              ['reviews', '⭐ Review'],
              ['info',    'ℹ Info'],
            ].map(([t, l]) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`shrink-0 py-3.5 px-4 text-sm font-bold border-b-2 transition-all ${
                  tab === t
                    ? 'border-[#f6339a] text-[#f6339a]'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">

        {/* ── Portofolio ── */}
        {tab === 'porto' && (
          <div>
            {!mua.portfolio || mua.portfolio.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <div className="text-4xl mb-3">🖼</div>
                <p className="font-semibold">Belum ada portofolio</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {mua.portfolio.map(photo => (
                  <div key={photo.id} className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-pink-100 to-rose-100 relative group">
                    {photo.photoUrl ? (
                        <img src={`http://localhost:3000${photo.photoUrl}`} alt={photo.caption} className="w-full h-full object-cover" />

                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#f6339a] text-4xl font-black">
                        📷
                      </div>
                    )}
                    {photo.caption && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-white text-xs font-medium">{photo.caption}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Paket & Harga ── */}
        {tab === 'packages' && (
          <div className="space-y-4">
            {mua.servicePackages?.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <p>Belum ada paket layanan</p>
              </div>
            ) : (
              mua.servicePackages?.map(pkg => (
                <div key={pkg.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{pkg.name}</h3>
                      {pkg.description && <p className="text-sm text-gray-500 mt-0.5">{pkg.description}</p>}
                      <p className="text-xs text-gray-400 mt-1">~{pkg.durationMinutes} menit</p>
                    </div>
                    <span className="font-black text-[#f6339a] text-xl shrink-0 ml-4">
                      {formatIDR(pkg.basePrice)}
                    </span>
                  </div>
                  {pkg.includedServices?.length > 0 && (
                    <ul className="space-y-1">
                      {pkg.includedServices.map((s, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="text-[#f6339a] text-xs">✓</span> {s}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))
            )}

            {/* Add-on */}
            {mua.packageAddons?.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-bold text-gray-900 mb-3">Add-on Tersedia</h3>
                <div className="space-y-2">
                  {mua.packageAddons.map(a => (
                    <div key={a.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div>
                        <p className="text-sm font-semibold text-gray-700">{a.name}</p>
                        {a.description && <p className="text-xs text-gray-400">{a.description}</p>}
                      </div>
                      <span className="text-sm font-bold text-gray-800">+{formatIDR(a.price)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Jadwal ── */}
        {tab === 'schedule' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-bold text-gray-900 mb-4">Slot Tersedia</h3>
            {!mua.schedules || mua.schedules.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p className="text-sm">Tidak ada jadwal tersedia saat ini</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Group jadwal by date */}
                {Object.entries(
                  mua.schedules.reduce((acc, s) => {
                    const d = new Date(s.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })
                    if (!acc[d]) acc[d] = []
                    acc[d].push(s)
                    return acc
                  }, {})
                ).map(([date, slots]) => (
                  <div key={date}>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">{date}</p>
                    <div className="flex flex-wrap gap-2">
                      {slots.map(s => (
                        <span key={s.id} className="text-sm font-semibold bg-pink-50 text-[#f6339a] border border-pink-100 px-3 py-1.5 rounded-xl">
                          {s.startTime} – {s.endTime}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Review ── */}
        {tab === 'reviews' && (
          <div className="space-y-4">
            {!mua.reviews || mua.reviews.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <div className="text-4xl mb-3">⭐</div>
                <p className="font-semibold">Belum ada review</p>
              </div>
            ) : (
              mua.reviews.map(r => (
                <div key={r.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{r.client?.name || 'Klien'}</p>
                      <p className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                    <div className="flex">
                      {[1,2,3,4,5].map(i => (
                        <span key={i} className={`text-sm ${i <= r.rating ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
                      ))}
                    </div>
                  </div>
                  {r.content && <p className="text-sm text-gray-600">{r.content}</p>}
                  {r.muaReply && (
                    <div className="mt-3 bg-gray-50 rounded-xl px-4 py-3 border-l-2 border-[#f6339a]">
                      <p className="text-xs font-bold text-[#f6339a] mb-1">Balasan MUA</p>
                      <p className="text-sm text-gray-600">{r.muaReply}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* ── Info ── */}
        {tab === 'info' && (
          <div className="space-y-4">
            {mua.bio && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-bold text-gray-900 mb-2">Tentang</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{mua.bio}</p>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 mb-3">Spesialisasi</h3>
              <div className="flex flex-wrap gap-2">
                {mua.specializations?.map(s => (
                  <span key={s} className="text-sm bg-gray-50 text-gray-700 border border-gray-200 px-3 py-1 rounded-full font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 mb-3">Info Skinprep</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  {mua.canUseOwnSkinprep ? '✅' : '❌'} Bisa gunakan skinprep milik MUA
                </p>
                <p>
                  {mua.canUseClientSkinprep ? '✅' : '❌'} Bisa gunakan skinprep milik klien
                </p>
                {mua.canUseOwnSkinprep && mua.ownSkinprepIngredients?.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Bahan utama skinprep MUA</p>
                    <div className="flex flex-wrap gap-1.5">
                      {mua.ownSkinprepIngredients.map(b => (
                        <span key={b} className={`text-xs px-2.5 py-1 rounded-full border font-medium ${
                          mua.conflictIngredients?.includes(b)
                            ? 'bg-red-50 text-red-600 border-red-200'
                            : 'bg-gray-50 text-gray-600 border-gray-200'
                        }`}>
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 mb-2">Biaya Transport</h3>
              <p className="text-sm text-gray-600">
                {mua.transportType === 'free'   && '🚗 Gratis (MUA datang ke lokasi klien)'}
                {mua.transportType === 'flat'   && `🚗 Flat fee ${formatIDR(mua.transportFlatFee)}`}
                {mua.transportType === 'per_km' && `🚗 ${formatIDR(mua.transportPerKmRate)}/km`}
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default MuaDetail