import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

const SKIN_TYPES = ['normal', 'oily', 'dry', 'combination', 'sensitive']
const SKIN_CONDITIONS = ['acne-prone', 'rosacea', 'hyperpigmentasi', 'bekas jerawat', 'normal']
const MAKEUP_STYLES = ['Natural', 'Glam', 'Korean', 'Editorial', 'Bridal', 'Theatrical']
const EVENTS = ['Pernikahan', 'Wisuda', 'Photoshoot', 'Daily', 'Party']
const COMMON_INGREDIENTS = ['paraben', 'fragrance', 'alcohol denat', 'retinol', 'AHA/BHA', 'niacinamide', 'sulfat', 'silikon']

const ClientProfilePage = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    defaultLocation: '',
    skinType: '',
    skinTone: '',
    skinConditions: [],
    sensitiveIngredients: [],
    preferredStyles: [],
    preferredEvents: [],
  })

  const [customIngredient, setCustomIngredient] = useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/profile/client')
        if (res.data.data) {
          const p = res.data.data
          setForm({
            defaultLocation: p.defaultLocation || '',
            skinType: p.skinType || '',
            skinTone: p.skinTone || '',
            skinConditions: p.skinConditions || [],
            sensitiveIngredients: p.sensitiveIngredients || [],
            preferredStyles: p.preferredStyles || [],
            preferredEvents: p.preferredEvents || [],
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
    if (val && !form.sensitiveIngredients.includes(val)) {
      setForm((prev) => ({
        ...prev,
        sensitiveIngredients: [...prev.sensitiveIngredients, val],
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
      await api.put('/profile/client', form)
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
        <h2 className="text-xl font-bold text-gray-800 mt-4 mb-1">Profil Saya</h2>
        <p className="text-gray-500 text-sm mb-6">Lengkapi profilmu agar MUA bisa mempersiapkan yang terbaik untukmu</p>

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

          {/* Lokasi */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="font-semibold text-gray-700 mb-3">Lokasi Default</h3>
            <input
              type="text"
              value={form.defaultLocation}
              onChange={(e) => setForm({ ...form, defaultLocation: e.target.value })}
              placeholder="Contoh: Jakarta Selatan"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>

          {/* Profil Kulit */}
          <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
            <h3 className="font-semibold text-gray-700">Profil Kulit</h3>

            {/* Tipe Kulit */}
            <div>
              <label className="text-sm text-gray-600 mb-2 block">Tipe Kulit</label>
              <div className="flex flex-wrap gap-2">
                {SKIN_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setForm({ ...form, skinType: type })}
                    className={`px-3 py-1 rounded-full text-sm border transition ${
                      form.skinType === type
                        ? 'bg-pink-500 text-white border-pink-500'
                        : 'border-gray-300 text-gray-600 hover:border-pink-300'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Warna Kulit */}
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Warna Kulit</label>
              <input
                type="text"
                value={form.skinTone}
                onChange={(e) => setForm({ ...form, skinTone: e.target.value })}
                placeholder="Contoh: sawo matang, kuning langsat"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>

            {/* Kondisi Kulit */}
            <div>
              <label className="text-sm text-gray-600 mb-2 block">Kondisi Kulit</label>
              <div className="flex flex-wrap gap-2">
                {SKIN_CONDITIONS.map((condition) => (
                  <button
                    key={condition}
                    type="button"
                    onClick={() => toggleItem('skinConditions', condition)}
                    className={`px-3 py-1 rounded-full text-sm border transition ${
                      form.skinConditions.includes(condition)
                        ? 'bg-pink-500 text-white border-pink-500'
                        : 'border-gray-300 text-gray-600 hover:border-pink-300'
                    }`}
                  >
                    {condition}
                  </button>
                ))}
              </div>
            </div>

            {/* Sensitivitas Bahan */}
            <div>
              <label className="text-sm text-gray-600 mb-2 block">Bahan yang Dihindari</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {COMMON_INGREDIENTS.map((ing) => (
                  <button
                    key={ing}
                    type="button"
                    onClick={() => toggleItem('sensitiveIngredients', ing)}
                    className={`px-3 py-1 rounded-full text-sm border transition ${
                      form.sensitiveIngredients.includes(ing)
                        ? 'bg-pink-500 text-white border-pink-500'
                        : 'border-gray-300 text-gray-600 hover:border-pink-300'
                    }`}
                  >
                    {ing}
                  </button>
                ))}
              </div>

              {/* Tambah bahan custom */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customIngredient}
                  onChange={(e) => setCustomIngredient(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomIngredient())}
                  placeholder="Tambah bahan lain..."
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

              {/* Tampilkan bahan custom yang sudah ditambah */}
              {form.sensitiveIngredients.filter(i => !COMMON_INGREDIENTS.includes(i)).length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.sensitiveIngredients
                    .filter(i => !COMMON_INGREDIENTS.includes(i))
                    .map((ing) => (
                      <span
                        key={ing}
                        className="px-3 py-1 rounded-full text-sm bg-pink-500 text-white border border-pink-500 flex items-center gap-1"
                      >
                        {ing}
                        <button
                          type="button"
                          onClick={() => toggleItem('sensitiveIngredients', ing)}
                          className="ml-1 hover:text-pink-200"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Preferensi */}
          <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
            <h3 className="font-semibold text-gray-700">Preferensi Makeup</h3>

            {/* Style */}
            <div>
              <label className="text-sm text-gray-600 mb-2 block">Style Favorit</label>
              <div className="flex flex-wrap gap-2">
                {MAKEUP_STYLES.map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => toggleItem('preferredStyles', style)}
                    className={`px-3 py-1 rounded-full text-sm border transition ${
                      form.preferredStyles.includes(style)
                        ? 'bg-pink-500 text-white border-pink-500'
                        : 'border-gray-300 text-gray-600 hover:border-pink-300'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {/* Event */}
            <div>
              <label className="text-sm text-gray-600 mb-2 block">Event yang Sering Dihadiri</label>
              <div className="flex flex-wrap gap-2">
                {EVENTS.map((event) => (
                  <button
                    key={event}
                    type="button"
                    onClick={() => toggleItem('preferredEvents', event)}
                    className={`px-3 py-1 rounded-full text-sm border transition ${
                      form.preferredEvents.includes(event)
                        ? 'bg-pink-500 text-white border-pink-500'
                        : 'border-gray-300 text-gray-600 hover:border-pink-300'
                    }`}
                  >
                    {event}
                  </button>
                ))}
              </div>
            </div>
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

export default ClientProfilePage