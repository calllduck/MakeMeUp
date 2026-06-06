import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

const SPECIALIZATIONS = ['Bridal', 'Wisuda', 'Editorial', 'Theatrical', 'Korean', 'Natural', 'Glam', 'Airbrush', 'SFX']
const MAKEUP_STYLES = ['Natural', 'Glam', 'Korean', 'Editorial', 'Bridal', 'Theatrical']

const MuaProfilePage = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    brandName: '',
    bio: '',
    operationalLocation: '',
    yearsExperience: '',
    specializations: [],
    makeupStyles: [],
    canUseOwnSkinprep: true,
    canUseClientSkinprep: true,
    ownSkinprepIngredients: [],
    transportType: 'per_km',
    transportFlatFee: '',
    transportPerKmRate: '',
  })

  const [customIngredient, setCustomIngredient] = useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/profile/mua')
        if (res.data.data) {
          const p = res.data.data
          setForm({
            brandName: p.brandName || '',
            bio: p.bio || '',
            operationalLocation: p.operationalLocation || '',
            yearsExperience: p.yearsExperience || '',
            specializations: p.specializations || [],
            makeupStyles: p.makeupStyles || [],
            canUseOwnSkinprep: p.canUseOwnSkinprep ?? true,
            canUseClientSkinprep: p.canUseClientSkinprep ?? true,
            ownSkinprepIngredients: p.ownSkinprepIngredients || [],
            transportType: p.transportType || 'per_km',
            transportFlatFee: p.transportFlatFee || '',
            transportPerKmRate: p.transportPerKmRate || '',
          })
        }
      } catch (err) {
        setError('Gagal memuat profil')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const toggleItem = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((i) => i !== value)
        : [...prev[field], value],
    }))
  }

  const addCustomIngredient = () => {
    const val = customIngredient.trim().toLowerCase()
    if (val && !form.ownSkinprepIngredients.includes(val)) {
      setForm((prev) => ({
        ...prev,
        ownSkinprepIngredients: [...prev.ownSkinprepIngredients, val],
      }))
    }
    setCustomIngredient('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSuccess('')
    setError('')

    try {
      const payload = {
        ...form,
        yearsExperience: form.yearsExperience ? parseInt(form.yearsExperience) : undefined,
        transportFlatFee: form.transportFlatFee ? parseFloat(form.transportFlatFee) : undefined,
        transportPerKmRate: form.transportPerKmRate ? parseFloat(form.transportPerKmRate) : undefined,
      }

      await api.put('/profile/mua', payload)
      setSuccess('Profil berhasil disimpan!')
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan profil')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Memuat profil...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="max-w-2xl mx-auto p-4">
        <h2 className="text-xl font-bold text-gray-800 mt-4 mb-1">Profil MUA</h2>
        <p className="text-gray-500 text-sm mb-6">Lengkapi profilmu agar klien bisa menemukan dan mempercayaimu</p>

        {success && (
          <div className="bg-green-50 text-green-600 text-sm px-4 py-3 rounded-lg mb-4">
            {success}
          </div>
        )}
        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Info Dasar */}
          <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
            <h3 className="font-semibold text-gray-700">Informasi Dasar</h3>

            <div>
              <label className="text-sm text-gray-600 mb-1 block">Nama Brand / Nama MUA *</label>
              <input
                type="text"
                value={form.brandName}
                onChange={(e) => setForm({ ...form, brandName: e.target.value })}
                placeholder="Contoh: Siti Beauty Studio"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-1 block">Bio</label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Ceritakan tentang dirimu dan pengalamanmu sebagai MUA..."
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-1 block">Lokasi Operasional *</label>
              <input
                type="text"
                value={form.operationalLocation}
                onChange={(e) => setForm({ ...form, operationalLocation: e.target.value })}
                placeholder="Contoh: Jakarta Selatan"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-1 block">Tahun Pengalaman</label>
              <input
                type="number"
                value={form.yearsExperience}
                onChange={(e) => setForm({ ...form, yearsExperience: e.target.value })}
                placeholder="Contoh: 5"
                min="0"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>
          </div>

          {/* Spesialisasi */}
          <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
            <h3 className="font-semibold text-gray-700">Spesialisasi & Style</h3>

            <div>
              <label className="text-sm text-gray-600 mb-2 block">Spesialisasi *</label>
              <div className="flex flex-wrap gap-2">
                {SPECIALIZATIONS.map((spec) => (
                  <button
                    key={spec}
                    type="button"
                    onClick={() => toggleItem('specializations', spec)}
                    className={`px-3 py-1 rounded-full text-sm border transition ${
                      form.specializations.includes(spec)
                        ? 'bg-pink-500 text-white border-pink-500'
                        : 'border-gray-300 text-gray-600 hover:border-pink-300'
                    }`}
                  >
                    {spec}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-2 block">Style Makeup *</label>
              <div className="flex flex-wrap gap-2">
                {MAKEUP_STYLES.map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => toggleItem('makeupStyles', style)}
                    className={`px-3 py-1 rounded-full text-sm border transition ${
                      form.makeupStyles.includes(style)
                        ? 'bg-pink-500 text-white border-pink-500'
                        : 'border-gray-300 text-gray-600 hover:border-pink-300'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Skinprep */}
          <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
            <h3 className="font-semibold text-gray-700">Penggunaan Skinprep</h3>

            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.canUseOwnSkinprep}
                  onChange={(e) => setForm({ ...form, canUseOwnSkinprep: e.target.checked })}
                  className="w-4 h-4 accent-pink-500"
                />
                <span className="text-sm text-gray-700">Bisa menggunakan skinprep milik saya sendiri</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.canUseClientSkinprep}
                  onChange={(e) => setForm({ ...form, canUseClientSkinprep: e.target.checked })}
                  className="w-4 h-4 accent-pink-500"
                />
                <span className="text-sm text-gray-700">Bisa menggunakan skinprep milik klien</span>
              </label>
            </div>

            {form.canUseOwnSkinprep && (
              <div>
                <label className="text-sm text-gray-600 mb-2 block">Bahan Utama Skinprep Saya</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={customIngredient}
                    onChange={(e) => setCustomIngredient(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomIngredient())}
                    placeholder="Contoh: niacinamide"
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                  />
                  <button
                    type="button"
                    onClick={addCustomIngredient}
                    className="px-4 py-2 bg-pink-500 text-white text-sm rounded-lg hover:bg-pink-600 transition"
                  >
                    Tambah
                  </button>
                </div>

                {form.ownSkinprepIngredients.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {form.ownSkinprepIngredients.map((ing) => (
                      <span
                        key={ing}
                        className="px-3 py-1 rounded-full text-sm bg-pink-500 text-white flex items-center gap-1"
                      >
                        {ing}
                        <button
                          type="button"
                          onClick={() => toggleItem('ownSkinprepIngredients', ing)}
                          className="ml-1 hover:text-pink-200"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Transport */}
          <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
            <h3 className="font-semibold text-gray-700">Biaya Transport</h3>

            <div className="flex gap-2">
              {['free', 'per_km', 'flat'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setForm({ ...form, transportType: type })}
                  className={`px-3 py-1 rounded-full text-sm border transition ${
                    form.transportType === type
                      ? 'bg-pink-500 text-white border-pink-500'
                      : 'border-gray-300 text-gray-600 hover:border-pink-300'
                  }`}
                >
                  {type === 'free' ? 'Gratis' : type === 'per_km' ? 'Per KM' : 'Flat Fee'}
                </button>
              ))}
            </div>

            {form.transportType === 'per_km' && (
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Tarif per KM (Rp)</label>
                <input
                  type="number"
                  value={form.transportPerKmRate}
                  onChange={(e) => setForm({ ...form, transportPerKmRate: e.target.value })}
                  placeholder="Contoh: 5000"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
              </div>
            )}

            {form.transportType === 'flat' && (
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Flat Fee (Rp)</label>
                <input
                  type="number"
                  value={form.transportFlatFee}
                  onChange={(e) => setForm({ ...form, transportFlatFee: e.target.value })}
                  placeholder="Contoh: 50000"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-pink-500 hover:bg-pink-600 text-white font-medium py-2 rounded-lg text-sm transition disabled:opacity-50"
          >
            {saving ? 'Menyimpan...' : 'Simpan Profil'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default MuaProfilePage