import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { profileAPI, bookingAPI, reviewAPI } from '../services/api'

const formatIDR = (amount) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount)

const SKIN_TYPES = ['normal', 'oily', 'dry', 'combination', 'sensitive']
const SKIN_TONES = ['Putih', 'Kuning Langsat', 'Sawo Matang', 'Gelap']
const SKIN_CONDITIONS = ['Acne-prone', 'Rosacea', 'Hyperpigmentasi', 'Bekas jerawat', 'Normal']
const MAKEUP_STYLES = ['Natural/No-makeup look', 'Glam', 'Korean', 'Editorial', 'Bridal', 'Theatrical']
const EVENTS = ['Pernikahan', 'Wisuda', 'Photoshoot', 'Daily', 'Party']
const INGREDIENTS = ['paraben', 'fragrance', 'alcohol denat', 'retinol', 'AHA/BHA', 'niacinamide', 'sulfat', 'silikon']

const STATUS_MAP = {
  pending:   ['Menunggu',     'bg-amber-50  text-amber-700  border-amber-200'],
  confirmed: ['Dikonfirmasi', 'bg-blue-50   text-blue-700   border-blue-200'],
  paid:      ['Dibayar',      'bg-violet-50 text-violet-700 border-violet-200'],
  ongoing:   ['Berlangsung',  'bg-orange-50 text-orange-700 border-orange-200'],
  completed: ['Selesai',      'bg-green-50  text-green-700  border-green-200'],
  cancelled: ['Dibatalkan',   'bg-gray-100  text-gray-500   border-gray-200'],
  rejected:  ['Ditolak',      'bg-red-50    text-red-700    border-red-200'],
}

const StatusBadge = ({ status }) => {
  const [label, cls] = STATUS_MAP[status] || ['Unknown', 'bg-gray-50 text-gray-500 border-gray-200']
  return (
    <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full border ${cls}`}>
      {label}
    </span>
  )
}

const ClientDashboard = () => {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()

  const [tab, setTab] = useState('bookings')

  // State booking
  const [bookings, setBookings]     = useState([])
  const [bookLoading, setBookLoading] = useState(true)
  const [bookError, setBookError]   = useState('')

  // State profil
  const [profile, setProfile]         = useState(null)
  const [profLoading, setProfLoading] = useState(false)
  const [profSaving, setProfSaving]   = useState(false)
  const [profSuccess, setProfSuccess] = useState('')
  const [profError, setProfError]     = useState('')

  // State form profil — diisi saat data profil berhasil diambil
  const [form, setForm] = useState({
    defaultLocation:      '',
    skinType:             '',
    skinTone:             '',
    skinConditions:       [],
    sensitiveIngredients: [],
    preferredStyles:      [],
    preferredEvents:      [],
    customIngredient:     '', // untuk input bahan manual, tidak dikirim ke backend
  })

  // State review modal
  const [reviewModal, setReviewModal]   = useState(null) // booking yang mau direview
  const [reviewForm, setReviewForm]     = useState({ rating: 5, content: '' })
  const [reviewLoading, setReviewLoading] = useState(false)
  const [reviewError, setReviewError]   = useState('')

  // ── Fetch booking saat tab bookings dibuka ──
  useEffect(() => {
    fetchBookings()
  }, [])

  // ── Fetch profil saat tab profile dibuka ──
  useEffect(() => {
    if (tab === 'profile' && !profile) {
      fetchProfile()
    }
  }, [tab])

  const fetchBookings = async () => {
    setBookLoading(true)
    setBookError('')
    try {
      const res = await bookingAPI.getBookings()
      setBookings(res.data.data)
    } catch {
      setBookError('Gagal memuat booking.')
    } finally {
      setBookLoading(false)
    }
  }

  const fetchProfile = async () => {
    setProfLoading(true)
    try {
      const res = await profileAPI.getClientProfile()
      const p   = res.data.data
      setProfile(p)
      // Isi form dengan data yang sudah ada
      if (p) {
        setForm(f => ({
          ...f,
          defaultLocation:      p.defaultLocation      || '',
          skinType:             p.skinType             || '',
          skinTone:             p.skinTone             || '',
          skinConditions:       p.skinConditions       || [],
          sensitiveIngredients: p.sensitiveIngredients || [],
          preferredStyles:      p.preferredStyles      || [],
          preferredEvents:      p.preferredEvents      || [],
        }))
      }
    } catch {
      // Profil belum ada — tidak perlu error, form kosong saja
    } finally {
      setProfLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    setProfSaving(true)
    setProfError('')
    setProfSuccess('')
    try {
      const { customIngredient, ...data } = form
      const res = await profileAPI.updateClientProfile(data)
      setProfile(res.data.data)
      setProfSuccess('Profil berhasil disimpan!')
      setTimeout(() => setProfSuccess(''), 3000)
    } catch (err) {
      setProfError(err.response?.data?.message || 'Gagal menyimpan profil.')
    } finally {
      setProfSaving(false)
    }
  }

  // Toggle item di array (untuk checkbox-style multi-select)
  const toggleArray = (key, value) => {
    setForm(f => ({
      ...f,
      [key]: f[key].includes(value)
        ? f[key].filter(x => x !== value)
        : [...f[key], value]
    }))
  }

  const addCustomIngredient = () => {
    const val = form.customIngredient.trim()
    if (!val || form.sensitiveIngredients.includes(val)) return
    setForm(f => ({
      ...f,
      sensitiveIngredients: [...f.sensitiveIngredients, val],
      customIngredient: ''
    }))
  }

  const handleSubmitReview = async () => {
    if (!reviewForm.content.trim()) {
      return setReviewError('Ulasan tidak boleh kosong.')
    }
    setReviewLoading(true)
    setReviewError('')
    try {
      await reviewAPI.createReview({
        bookingId: reviewModal.id,
        rating:    reviewForm.rating,
        content:   reviewForm.content,
      })
      setReviewModal(null)
      setReviewForm({ rating: 5, content: '' })
      fetchBookings() // refresh list
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Gagal mengirim review.')
    } finally {
      setReviewLoading(false)
    }
  }

  return (
    <div className="pt-16 min-h-screen bg-[#fafafa]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-black text-gray-900">Dashboard 👋</h1>
          <p className="text-gray-400 text-sm mt-0.5">Halo, {user?.name}!</p>
        </div>

        {/* Tab nav */}
        <div className="flex bg-white rounded-2xl border border-gray-100 p-1 mb-6 gap-1">
          {[
            ['bookings', '📋 Booking Saya'],
            ['profile',  '👤 Profil & Kulit'],
          ].map(([t, l]) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 px-3 text-sm font-bold rounded-xl transition-all ${
                tab === t ? 'bg-[#f6339a] text-white shadow-sm' : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        {/* ── Tab Booking ── */}
        {tab === 'bookings' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Riwayat Booking</h2>
              <button
                onClick={() => navigate('/search')}
                className="text-sm font-bold text-[#f6339a] border border-[#f6339a]/30 px-4 py-2 rounded-full hover:bg-pink-50 transition-colors"
              >
                + Booking Baru
              </button>
            </div>

            {bookLoading && (
              <div className="text-center py-16 text-gray-400">
                <div className="text-3xl mb-2">📋</div>
                <p className="text-sm">Memuat booking...</p>
              </div>
            )}

            {bookError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                {bookError}
              </div>
            )}

            {!bookLoading && !bookError && bookings.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <div className="text-4xl mb-3">📭</div>
                <p className="font-semibold">Belum ada booking</p>
                <p className="text-sm mt-1">Yuk cari MUA yang cocok!</p>
                <button
                  onClick={() => navigate('/search')}
                  className="mt-4 bg-[#f6339a] text-white font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-[#e01f87] transition-colors"
                >
                  Cari MUA
                </button>
              </div>
            )}

            <div className="space-y-3">
              {bookings.map(b => (
                <div key={b.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-gray-900">
                          {b.muaProfile?.brandName || 'MUA'}
                        </h3>
                        <StatusBadge status={b.status} />
                      </div>
                      <p className="text-xs text-gray-400 font-mono mt-0.5">{b.bookingCode}</p>
                    </div>
                    <p className="font-black text-[#f6339a] text-lg shrink-0">
                      {formatIDR(b.totalPrice)}
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-2 text-xs text-gray-500 mb-3">
                    <span>📦 {b.package?.name || '-'}</span>
                    <span>📅 {new Date(b.sessionDate).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    <span>⏰ {b.sessionStart}</span>
                  </div>

                  <p className="text-xs text-gray-500 mb-3">📍 {b.sessionLocation}</p>

                  <div className="flex gap-2 flex-wrap">
                    {/* Tombol bayar kalau sudah confirmed */}
                    {b.status === 'confirmed' && (
                      <button
                        onClick={() => navigate(`/booking/${b.muaProfileId}?pay=${b.id}`)}
                        className="text-sm font-bold bg-[#f6339a] text-white px-4 py-2 rounded-xl hover:bg-[#e01f87] transition-colors"
                      >
                        💳 Bayar Sekarang
                      </button>
                    )}

                    {(b.status === 'paid' || b.status === 'ongoing') && (
                      <button
                        onClick={async () => {
                          try {
                            await bookingAPI.completeBooking(b.id)
                            fetchBookings()
                          } catch {}
                        }}
                        className="text-sm font-bold bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl transition-colors"
                      >
                        ✓ Konfirmasi Selesai
                      </button>
                    )}

                    {/* Tombol review kalau sudah completed dan belum review */}
                    {b.status === 'completed' && !b.review && (
                      <button
                        onClick={() => { setReviewModal(b); setReviewForm({ rating: 5, content: '' }) }}
                        className="text-sm font-bold bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded-xl transition-colors"
                      >
                        ⭐ Beri Review
                      </button>
                    )}

                    {/* Sudah review */}
                    {b.status === 'completed' && b.review && (
                      <span className="text-xs text-green-600 font-semibold bg-green-50 border border-green-200 px-3 py-1.5 rounded-xl">
                        ✓ Sudah direview
                      </span>
                    )}

                    {/* Lihat detail MUA */}
                    <button
                      onClick={() => navigate(`/mua/${b.muaProfileId}`)}
                      className="text-sm font-semibold text-gray-500 border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      Lihat MUA
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Tab Profil ── */}
        {tab === 'profile' && (
          <div className="space-y-5">

            {profLoading && (
              <div className="text-center py-16 text-gray-400 text-sm">Memuat profil...</div>
            )}

            {!profLoading && (
              <>
                {/* Info dasar */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h2 className="font-bold text-gray-900 mb-4">Informasi Dasar</h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Nama</p>
                        <p className="font-semibold text-gray-800">{user?.name}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Email</p>
                        <p className="font-semibold text-gray-800">{user?.email}</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                        Lokasi Default
                      </label>
                      <input
                        type="text"
                        value={form.defaultLocation}
                        onChange={e => setForm(f => ({ ...f, defaultLocation: e.target.value }))}
                        placeholder="Contoh: Jl. Kemang Raya No. 10, Jakarta Selatan"
                        className="w-full bg-gray-50 border border-gray-200 focus:border-[#f6339a] rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Profil kulit */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h2 className="font-bold text-gray-900 mb-1">Profil Kulit</h2>
                  <p className="text-xs text-gray-400 mb-4">
                    Digunakan untuk cek kompatibilitas dengan skinprep MUA
                  </p>

                  <div className="space-y-5">
                    {/* Tipe kulit */}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                        Tipe Kulit
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {SKIN_TYPES.map(t => (
                          <button
                            key={t}
                            onClick={() => setForm(f => ({ ...f, skinType: f.skinType === t ? '' : t }))}
                            className={`text-sm px-3 py-1.5 rounded-full border font-medium transition-all capitalize ${
                              form.skinType === t
                                ? 'bg-[#f6339a] text-white border-[#f6339a]'
                                : 'border-gray-200 text-gray-500 hover:border-[#f6339a] hover:text-[#f6339a]'
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Warna kulit */}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                        Warna Kulit
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {SKIN_TONES.map(t => (
                          <button
                            key={t}
                            onClick={() => setForm(f => ({ ...f, skinTone: f.skinTone === t ? '' : t }))}
                            className={`text-sm px-3 py-1.5 rounded-full border font-medium transition-all ${
                              form.skinTone === t
                                ? 'bg-[#f6339a] text-white border-[#f6339a]'
                                : 'border-gray-200 text-gray-500 hover:border-[#f6339a] hover:text-[#f6339a]'
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Kondisi kulit */}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                        Kondisi Kulit
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {SKIN_CONDITIONS.map(c => (
                          <button
                            key={c}
                            onClick={() => toggleArray('skinConditions', c)}
                            className={`text-sm px-3 py-1.5 rounded-full border font-medium transition-all ${
                              form.skinConditions.includes(c)
                                ? 'bg-[#f6339a] text-white border-[#f6339a]'
                                : 'border-gray-200 text-gray-500 hover:border-[#f6339a] hover:text-[#f6339a]'
                            }`}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Sensitivitas bahan */}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                        Bahan yang Dihindari
                      </label>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {INGREDIENTS.map(i => (
                          <button
                            key={i}
                            onClick={() => toggleArray('sensitiveIngredients', i)}
                            className={`text-sm px-3 py-1.5 rounded-full border font-medium transition-all ${
                              form.sensitiveIngredients.includes(i)
                                ? 'bg-red-500 text-white border-red-500'
                                : 'border-gray-200 text-gray-500 hover:border-red-400 hover:text-red-500'
                            }`}
                          >
                            {i}
                          </button>
                        ))}
                      </div>
                      {/* Input bahan kustom */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={form.customIngredient}
                          onChange={e => setForm(f => ({ ...f, customIngredient: e.target.value }))}
                          onKeyDown={e => e.key === 'Enter' && addCustomIngredient()}
                          placeholder="Tambah bahan lain..."
                          className="flex-1 bg-gray-50 border border-gray-200 focus:border-[#f6339a] rounded-xl px-4 py-2 text-sm outline-none transition-all"
                        />
                        <button
                          onClick={addCustomIngredient}
                          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold rounded-xl text-sm transition-colors"
                        >
                          + Tambah
                        </button>
                      </div>
                      {/* Tampilkan bahan kustom yang sudah ditambah */}
                      {form.sensitiveIngredients.filter(i => !INGREDIENTS.includes(i)).length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {form.sensitiveIngredients.filter(i => !INGREDIENTS.includes(i)).map(i => (
                            <span
                              key={i}
                              className="text-sm bg-red-50 text-red-500 border border-red-200 px-3 py-1 rounded-full font-medium flex items-center gap-1"
                            >
                              {i}
                              <button onClick={() => toggleArray('sensitiveIngredients', i)} className="hover:text-red-700">×</button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Preferensi */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h2 className="font-bold text-gray-900 mb-4">Preferensi Makeup</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                        Style Favorit
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {MAKEUP_STYLES.map(s => (
                          <button
                            key={s}
                            onClick={() => toggleArray('preferredStyles', s)}
                            className={`text-sm px-3 py-1.5 rounded-full border font-medium transition-all ${
                              form.preferredStyles.includes(s)
                                ? 'bg-[#f6339a] text-white border-[#f6339a]'
                                : 'border-gray-200 text-gray-500 hover:border-[#f6339a] hover:text-[#f6339a]'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                        Event yang Sering Dihadiri
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {EVENTS.map(e => (
                          <button
                            key={e}
                            onClick={() => toggleArray('preferredEvents', e)}
                            className={`text-sm px-3 py-1.5 rounded-full border font-medium transition-all ${
                              form.preferredEvents.includes(e)
                                ? 'bg-[#f6339a] text-white border-[#f6339a]'
                                : 'border-gray-200 text-gray-500 hover:border-[#f6339a] hover:text-[#f6339a]'
                            }`}
                          >
                            {e}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pesan sukses/error */}
                {profSuccess && (
                  <div className="bg-green-50 border border-green-200 text-green-700 text-sm font-medium px-4 py-3 rounded-xl">
                    ✓ {profSuccess}
                  </div>
                )}
                {profError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-medium px-4 py-3 rounded-xl">
                    {profError}
                  </div>
                )}

                <button
                  onClick={handleSaveProfile}
                  disabled={profSaving}
                  className="w-full bg-[#f6339a] hover:bg-[#e01f87] disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-colors"
                >
                  {profSaving ? 'Menyimpan...' : 'Simpan Profil'}
                </button>
              </>
            )}
          </div>
        )}

      </div>

      {/* ── Review Modal ── */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setReviewModal(null)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
            <h2 className="font-black text-gray-900 text-lg mb-1">Beri Review</h2>
            <p className="text-sm text-gray-400 mb-4">
              {reviewModal.muaProfile?.brandName}
            </p>

            {/* Rating bintang */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                Rating
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(i => (
                  <button
                    key={i}
                    onClick={() => setReviewForm(f => ({ ...f, rating: i }))}
                    className={`text-3xl transition-transform hover:scale-110 ${
                      i <= reviewForm.rating ? 'text-yellow-400' : 'text-gray-200'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            {/* Ulasan teks */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                Ulasan
              </label>
              <textarea
                value={reviewForm.content}
                onChange={e => setReviewForm(f => ({ ...f, content: e.target.value }))}
                placeholder="Ceritakan pengalaman kamu..."
                rows={4}
                className="w-full bg-gray-50 border border-gray-200 focus:border-[#f6339a] rounded-xl px-4 py-3 text-sm outline-none resize-none transition-all"
              />
            </div>

            {reviewError && (
              <div className="mb-3 bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded-xl">
                {reviewError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setReviewModal(null)}
                className="flex-1 py-3 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={reviewLoading}
                className="flex-1 py-3 bg-[#f6339a] hover:bg-[#e01f87] disabled:opacity-60 text-white font-bold rounded-xl transition-colors"
              >
                {reviewLoading ? 'Mengirim...' : 'Kirim Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ClientDashboard