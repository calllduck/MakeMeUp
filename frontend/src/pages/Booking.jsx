import { useState, useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { searchAPI, bookingAPI, paymentAPI } from '../services/api'

const formatIDR = (amount) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount)

const Booking = () => {
  const { muaId }                   = useParams()
  const [searchParams]              = useSearchParams()
  const payBookingId                = searchParams.get('pay') // kalau dari tombol "Bayar Sekarang"
  const navigate                    = useNavigate()
  const { user }                    = useAuth()

  const [mua, setMua]               = useState(null)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')

  // Step wizard: 1=pilih paket, 2=pilih jadwal & lokasi, 3=konfirmasi, 4=pembayaran, 5=selesai
  const [step, setStep]             = useState(payBookingId ? 4 : 1)
  const [selectedPkg, setPkg]       = useState(null)
  const [selectedAddons, setAddons] = useState([])
  const [selectedDate, setDate]     = useState('')
  const [selectedTime, setTime]     = useState('')
  const [location, setLocation]     = useState(user?.profile?.defaultLocation || '')
  const [notes, setNotes]           = useState('')
  const [bookingResult, setBookingResult] = useState(null)
  const [paymentUrl, setPaymentUrl] = useState(null)

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    const fetchMua = async () => {
      try {
        const res = await searchAPI.getMuaDetail(muaId)
        setMua(res.data.data)
      } catch {
        setError('MUA tidak ditemukan.')
      } finally {
        setLoading(false)
      }
    }
    fetchMua()
  }, [muaId])

  const toggleAddon = (addon) => {
    setAddons(prev =>
      prev.find(a => a.id === addon.id)
        ? prev.filter(a => a.id !== addon.id)
        : [...prev, addon]
    )
  }

  const addonsTotal  = selectedAddons.reduce((s, a) => s + Number(a.price), 0)
  const transportFee = mua?.transportType === 'flat' ? Number(mua.transportFlatFee || 0) : 0
  const total        = (selectedPkg ? Number(selectedPkg.basePrice) : 0) + addonsTotal + transportFee

  // Group jadwal by date untuk tampilan kalender
  const slotsByDate = mua?.schedules?.reduce((acc, s) => {
    const d = s.date.slice(0, 10)
    if (!acc[d]) acc[d] = []
    acc[d].push(s)
    return acc
  }, {}) || {}

  const availableDates  = Object.keys(slotsByDate).sort()
  const slotsForDate    = selectedDate ? (slotsByDate[selectedDate] || []) : []

  // ── Submit booking ──
  const handleSubmitBooking = async () => {
    if (!selectedPkg || !selectedDate || !selectedTime || !location) {
      return setSubmitError('Paket, tanggal, jam, dan lokasi wajib diisi.')
    }
    setSubmitting(true)
    setSubmitError('')
    try {
      const res = await bookingAPI.createBooking({
        muaProfileId:    mua.id,
        packageId:       selectedPkg.id,
        addonIds:        selectedAddons.map(a => a.id),
        sessionDate:     selectedDate,
        sessionStart:    selectedTime,
        sessionLocation: location,
        clientNotes:     notes,
      })
      setBookingResult(res.data.data)
      setStep(4) // lanjut ke pembayaran
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Gagal membuat booking.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Submit payment ──
  const handlePay = async () => {
  const bookingId = bookingResult?.id || payBookingId
  if (!bookingId) return
  setSubmitting(true)
  setSubmitError('')
  try {
    const res = await paymentAPI.createPayment(bookingId)
    const { token, redirectUrl } = res.data.data

    if (token && window.snap) {
      // Pakai Midtrans Snap popup
      window.snap.pay(token, {
        onSuccess: () => { setStep(5) },
        onPending: () => { setStep(5) },
        onError:   () => { setSubmitError('Pembayaran gagal, coba lagi.') },
        onClose:   () => { setSubmitError('Pembayaran dibatalkan.') },
      })
    } else if (redirectUrl) {
      // Fallback redirect
      setPaymentUrl(redirectUrl)
      window.open(redirectUrl, '_blank')
      setStep(5)
    }
  } catch (err) {
    setSubmitError(err.response?.data?.message || 'Gagal memproses pembayaran.')
  } finally {
    setSubmitting(false)
  }
}

  if (loading) return (
    <div className="pt-16 min-h-screen flex items-center justify-center text-gray-400">
      <div className="text-center">
        <div className="text-3xl mb-2">💄</div>
        <p className="text-sm">Memuat data...</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="pt-16 min-h-screen flex items-center justify-center text-gray-400">
      <div className="text-center">
        <p>{error}</p>
        <button onClick={() => navigate('/search')} className="mt-4 text-[#f6339a] font-semibold text-sm hover:underline">
          ← Kembali
        </button>
      </div>
    </div>
  )

  return (
    <div className="pt-16 min-h-screen bg-[#fafafa]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="mb-6">
          <button onClick={() => navigate(`/mua/${muaId}`)} className="text-sm text-gray-400 hover:text-gray-600 mb-3 flex items-center gap-1">
            ← Kembali ke profil
          </button>
          <h1 className="text-2xl font-black text-gray-900">Booking {mua?.brandName}</h1>
        </div>

        {/* Progress bar */}
        {step < 5 && (
          <div className="flex items-center gap-2 mb-8">
            {['Paket', 'Jadwal', 'Konfirmasi', 'Pembayaran'].map((label, i) => (
              <div key={label} className="flex items-center gap-2 flex-1">
                <div className={`flex items-center gap-1.5 ${i + 1 <= step ? 'text-[#f6339a]' : 'text-gray-300'}`}>
                  <div className={`w-6 h-6 rounded-full text-xs font-black flex items-center justify-center border-2 ${
                    i + 1 < step  ? 'bg-[#f6339a] border-[#f6339a] text-white' :
                    i + 1 === step ? 'border-[#f6339a] text-[#f6339a]' :
                    'border-gray-200 text-gray-300'
                  }`}>
                    {i + 1 < step ? '✓' : i + 1}
                  </div>
                  <span className="text-xs font-semibold hidden sm:block">{label}</span>
                </div>
                {i < 3 && <div className={`flex-1 h-0.5 ${i + 1 < step ? 'bg-[#f6339a]' : 'bg-gray-100'}`} />}
              </div>
            ))}
          </div>
        )}

        {/* ── Step 1: Pilih Paket ── */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-bold text-gray-900">Pilih Paket Layanan</h2>

            {mua?.servicePackages?.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p>MUA ini belum memiliki paket layanan</p>
              </div>
            ) : (
              mua?.servicePackages?.map(pkg => (
                <div
                  key={pkg.id}
                  onClick={() => setPkg(pkg)}
                  className={`bg-white rounded-2xl border-2 p-5 cursor-pointer transition-all ${
                    selectedPkg?.id === pkg.id
                      ? 'border-[#f6339a] shadow-sm'
                      : 'border-gray-100 hover:border-[#f6339a]/30'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-gray-900">{pkg.name}</h3>
                      {pkg.description && <p className="text-xs text-gray-400 mt-0.5">{pkg.description}</p>}
                      <p className="text-xs text-gray-400 mt-0.5">~{pkg.durationMinutes} menit</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-[#f6339a] text-lg">{formatIDR(pkg.basePrice)}</span>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedPkg?.id === pkg.id ? 'bg-[#f6339a] border-[#f6339a]' : 'border-gray-300'
                      }`}>
                        {selectedPkg?.id === pkg.id && <span className="text-white text-xs">✓</span>}
                      </div>
                    </div>
                  </div>
                  {pkg.includedServices?.length > 0 && (
                    <ul className="space-y-1 mt-3">
                      {pkg.includedServices.map((s, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs text-gray-600">
                          <span className="text-[#f6339a]">✓</span> {s}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))
            )}

            {/* Add-on */}
            {mua?.packageAddons?.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-bold text-gray-900 mb-3">Tambah Add-on (opsional)</h3>
                <div className="space-y-2">
                  {mua.packageAddons.map(a => (
                    <div
                      key={a.id}
                      onClick={() => toggleAddon(a)}
                      className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedAddons.find(x => x.id === a.id)
                          ? 'border-[#f6339a] bg-pink-50'
                          : 'border-gray-100 hover:border-[#f6339a]/30'
                      }`}
                    >
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

            <button
              onClick={() => selectedPkg && setStep(2)}
              disabled={!selectedPkg}
              className="w-full bg-[#f6339a] hover:bg-[#e01f87] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-colors"
            >
              Lanjut — Pilih Jadwal →
            </button>
          </div>
        )}

        {/* ── Step 2: Pilih Jadwal & Lokasi ── */}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="font-bold text-gray-900">Pilih Jadwal & Lokasi</h2>

            {/* Pilih tanggal */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 mb-3">Tanggal Tersedia</h3>
              {availableDates.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">Tidak ada slot tersedia saat ini</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {availableDates.map(d => (
                    <button
                      key={d}
                      onClick={() => { setDate(d); setTime('') }}
                      className={`px-4 py-2 rounded-xl border-2 text-sm font-semibold transition-all ${
                        selectedDate === d
                          ? 'border-[#f6339a] bg-pink-50 text-[#f6339a]'
                          : 'border-gray-100 text-gray-600 hover:border-[#f6339a]/30'
                      }`}
                    >
                      {new Date(d).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Pilih jam */}
            {selectedDate && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-bold text-gray-900 mb-3">Pilih Jam</h3>
                <div className="flex flex-wrap gap-2">
                  {slotsForDate.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setTime(s.startTime)}
                      className={`px-4 py-2 rounded-xl border-2 text-sm font-semibold transition-all ${
                        selectedTime === s.startTime
                          ? 'border-[#f6339a] bg-pink-50 text-[#f6339a]'
                          : 'border-gray-100 text-gray-600 hover:border-[#f6339a]/30'
                      }`}
                    >
                      {s.startTime}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Lokasi sesi */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 mb-3">Lokasi Sesi</h3>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="Masukkan alamat lengkap sesi makeup"
                className="w-full bg-gray-50 border border-gray-200 focus:border-[#f6339a] rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
              />
            </div>

            {/* Catatan */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 mb-3">Catatan untuk MUA (opsional)</h3>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Contoh: Acara wisuda S2, minta look elegant dan tahan lama"
                rows={3}
                className="w-full bg-gray-50 border border-gray-200 focus:border-[#f6339a] rounded-xl px-4 py-3 text-sm outline-none resize-none transition-all"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3.5 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                ← Kembali
              </button>
              <button
                onClick={() => (selectedDate && selectedTime && location) && setStep(3)}
                disabled={!selectedDate || !selectedTime || !location}
                className="flex-1 bg-[#f6339a] hover:bg-[#e01f87] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-colors"
              >
                Lanjut — Konfirmasi →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Konfirmasi ── */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="font-bold text-gray-900">Konfirmasi Booking</h2>

            <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
              <Row label="MUA"      value={mua?.brandName} />
              <Row label="Paket"    value={selectedPkg?.name} />
              <Row label="Tanggal"  value={new Date(selectedDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} />
              <Row label="Jam"      value={selectedTime} />
              <Row label="Lokasi"   value={location} />
              {notes && <Row label="Catatan" value={notes} />}
            </div>

            {/* Rincian harga */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 mb-3">Rincian Harga</h3>
              <div className="space-y-2">
                <PriceRow label={`Paket ${selectedPkg?.name}`} value={Number(selectedPkg?.basePrice)} />
                {selectedAddons.map(a => (
                  <PriceRow key={a.id} label={a.name} value={Number(a.price)} />
                ))}
                {transportFee > 0 && <PriceRow label="Biaya Transport" value={transportFee} />}
                <div className="border-t border-gray-100 pt-2 mt-2 flex items-center justify-between">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-black text-[#f6339a] text-lg">{formatIDR(total)}</span>
                </div>
              </div>
            </div>

            {submitError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                {submitError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-3.5 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                ← Kembali
              </button>
              <button
                onClick={handleSubmitBooking}
                disabled={submitting}
                className="flex-1 bg-[#f6339a] hover:bg-[#e01f87] disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-colors"
              >
                {submitting ? 'Memproses...' : 'Kirim Booking →'}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 4: Pembayaran ── */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
              <div className="text-5xl mb-3">🎉</div>
              <h2 className="font-black text-gray-900 text-xl mb-1">Booking Terkirim!</h2>
              <p className="text-gray-400 text-sm mb-4">
                Menunggu konfirmasi dari MUA. Setelah dikonfirmasi, kamu bisa melanjutkan pembayaran.
              </p>
              {bookingResult && (
                <div className="bg-gray-50 rounded-xl px-4 py-3 inline-block">
                  <p className="text-xs text-gray-400">Kode Booking</p>
                  <p className="font-black text-gray-900 font-mono">{bookingResult.bookingCode}</p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 mb-2">Lanjutkan Pembayaran</h3>
              <p className="text-sm text-gray-400 mb-4">
                Kamu akan diarahkan ke halaman Midtrans untuk menyelesaikan pembayaran.
              </p>

              {submitError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-3">
                  {submitError}
                </div>
              )}

              <button
                onClick={handlePay}
                disabled={submitting}
                className="w-full bg-[#f6339a] hover:bg-[#e01f87] disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-colors"
              >
                {submitting ? 'Memproses...' : '💳 Bayar Sekarang'}
              </button>
            </div>

            <button
              onClick={() => navigate('/dashboard/client')}
              className="w-full py-3 border border-gray-200 text-gray-500 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm"
            >
              Nanti saja — Lihat di Dashboard
            </button>
          </div>
        )}

        {/* ── Step 5: Selesai ── */}
        {step === 5 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">✨</div>
            <h2 className="font-black text-gray-900 text-2xl mb-2">Pembayaran Diproses!</h2>
            <p className="text-gray-400 text-sm mb-6">
              Selesaikan pembayaran di tab yang sudah dibuka. Setelah selesai, status booking akan diupdate otomatis.
            </p>
            {paymentUrl && (
              <button
                onClick={() => window.open(paymentUrl, '_blank')}
                className="mb-3 w-full bg-[#f6339a] hover:bg-[#e01f87] text-white font-bold py-3.5 rounded-xl transition-colors"
              >
                Buka Halaman Pembayaran
              </button>
            )}
            <button
              onClick={() => navigate('/dashboard/client')}
              className="w-full py-3 border border-gray-200 text-gray-500 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm"
            >
              Kembali ke Dashboard
            </button>
          </div>
        )}

      </div>
    </div>
  )
}

const Row = ({ label, value }) => (
  <div className="flex items-start justify-between gap-4">
    <span className="text-sm text-gray-400 shrink-0">{label}</span>
    <span className="text-sm font-semibold text-gray-800 text-right">{value}</span>
  </div>
)

const PriceRow = ({ label, value }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm text-gray-500">{label}</span>
    <span className="text-sm font-semibold text-gray-800">{formatIDR(value)}</span>
  </div>
)

export default Booking