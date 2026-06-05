import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { searchAPI, bookingAPI } from '../services/api'

const BookingPage = () => {
  const { muaId } = useParams()
  const navigate = useNavigate()

  const [mua, setMua] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [selectedPackage, setSelectedPackage] = useState(null)
  const [selectedAddons, setSelectedAddons] = useState([])
  const [selectedSchedule, setSelectedSchedule] = useState(null)
  const [sessionLocation, setSessionLocation] = useState('')
  const [clientNotes, setClientNotes] = useState('')

  useEffect(() => {
    const fetchMua = async () => {
      try {
        const res = await searchAPI.getMuaDetail(muaId)
        setMua(res.data.data)
      } catch {
        setError('Gagal memuat data MUA')
      } finally {
        setLoading(false)
      }
    }
    fetchMua()
  }, [muaId])

  const toggleAddon = (addon) => {
    setSelectedAddons(prev =>
      prev.find(a => a.id === addon.id)
        ? prev.filter(a => a.id !== addon.id)
        : [...prev, addon]
    )
  }

  const totalPrice = () => {
    if (!selectedPackage) return 0
    const addonsTotal = selectedAddons.reduce((sum, a) => sum + Number(a.price), 0)
    const transport = mua?.transportType === 'flat' ? Number(mua?.transportFlatFee || 0) : 0
    return Number(selectedPackage.basePrice) + addonsTotal + transport
  }

  const handleSubmit = async () => {
    if (!selectedPackage) return setError('Pilih paket layanan terlebih dahulu')
    if (!selectedSchedule) return setError('Pilih jadwal terlebih dahulu')
    if (!sessionLocation.trim()) return setError('Isi lokasi sesi terlebih dahulu')

    setSubmitting(true)
    setError('')

    try {
      const res = await bookingAPI.createBooking({
        muaProfileId: parseInt(muaId),
        packageId: selectedPackage.id,
        addonIds: selectedAddons.map(a => a.id),
        sessionDate: selectedSchedule.date,
        sessionStart: selectedSchedule.startTime,
        sessionLocation,
        clientNotes
      })
      navigate(`/bookings/${res.data.data.id}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal membuat booking')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-400">Memuat...</p></div>
  if (!mua) return <div className="min-h-screen flex items-center justify-center"><p className="text-red-400">MUA tidak ditemukan</p></div>

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-700 mb-2">← Kembali</button>
          <h1 className="text-2xl font-bold text-gray-800">Buat Booking</h1>
          <p className="text-gray-500">dengan <span className="font-medium text-pink-500">{mua.brandName}</span></p>
        </div>

        {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}

        {/* Pilih Paket */}
        <div className="bg-white rounded-xl p-5 mb-4 shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-3">1. Pilih Paket</h2>
          <div className="space-y-2">
            {mua.servicePackages?.map(pkg => (
              <div
                key={pkg.id}
                onClick={() => { setSelectedPackage(pkg); setSelectedAddons([]) }}
                className={`border rounded-lg p-3 cursor-pointer transition ${selectedPackage?.id === pkg.id ? 'border-pink-500 bg-pink-50' : 'border-gray-200 hover:border-pink-300'}`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-800">{pkg.name}</span>
                  <span className="text-pink-500 font-semibold">Rp {Number(pkg.basePrice).toLocaleString('id-ID')}</span>
                </div>
                {pkg.description && <p className="text-xs text-gray-400 mt-1">{pkg.description}</p>}
                <p className="text-xs text-gray-400 mt-1">Estimasi {pkg.durationMinutes} menit</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pilih Add-on */}
        {selectedPackage && mua.packageAddons?.length > 0 && (
          <div className="bg-white rounded-xl p-5 mb-4 shadow-sm">
            <h2 className="font-semibold text-gray-700 mb-3">2. Tambah Add-on (opsional)</h2>
            <div className="space-y-2">
              {mua.packageAddons.map(addon => (
                <div
                  key={addon.id}
                  onClick={() => toggleAddon(addon)}
                  className={`border rounded-lg p-3 cursor-pointer transition ${selectedAddons.find(a => a.id === addon.id) ? 'border-pink-500 bg-pink-50' : 'border-gray-200 hover:border-pink-300'}`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-gray-800">{addon.name}</span>
                    <span className="text-pink-500">+Rp {Number(addon.price).toLocaleString('id-ID')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pilih Jadwal */}
        <div className="bg-white rounded-xl p-5 mb-4 shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-3">{selectedPackage && mua.packageAddons?.length > 0 ? '3' : '2'}. Pilih Jadwal</h2>
          {mua.schedules?.length === 0 ? (
            <p className="text-gray-400 text-sm">Tidak ada jadwal tersedia</p>
          ) : (
            <div className="space-y-2">
              {mua.schedules?.map(schedule => (
                <div
                  key={schedule.id}
                  onClick={() => setSelectedSchedule(schedule)}
                  className={`border rounded-lg p-3 cursor-pointer transition ${selectedSchedule?.id === schedule.id ? 'border-pink-500 bg-pink-50' : 'border-gray-200 hover:border-pink-300'}`}
                >
                  <span className="text-gray-800 text-sm">
                    {new Date(schedule.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    {' · '}
                    {schedule.startTime} – {schedule.endTime}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Lokasi & Catatan */}
        <div className="bg-white rounded-xl p-5 mb-4 shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-3">Lokasi & Catatan</h2>
          <div className="mb-3">
            <label className="text-sm text-gray-600 mb-1 block">Lokasi sesi *</label>
            <input
              type="text"
              value={sessionLocation}
              onChange={e => setSessionLocation(e.target.value)}
              placeholder="Contoh: Jl. Mawar No. 5, Jakarta Selatan"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pink-400"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Catatan untuk MUA (opsional)</label>
            <textarea
              value={clientNotes}
              onChange={e => setClientNotes(e.target.value)}
              placeholder="Contoh: Tolong pakai warna natural, saya punya kulit sensitif"
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pink-400 resize-none"
            />
          </div>
        </div>

        {/* Ringkasan Harga */}
        {selectedPackage && (
          <div className="bg-white rounded-xl p-5 mb-4 shadow-sm">
            <h2 className="font-semibold text-gray-700 mb-3">Ringkasan Harga</h2>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Paket {selectedPackage.name}</span>
                <span>Rp {Number(selectedPackage.basePrice).toLocaleString('id-ID')}</span>
              </div>
              {selectedAddons.map(a => (
                <div key={a.id} className="flex justify-between text-gray-600">
                  <span>{a.name}</span>
                  <span>+Rp {Number(a.price).toLocaleString('id-ID')}</span>
                </div>
              ))}
              {mua.transportType === 'flat' && (
                <div className="flex justify-between text-gray-600">
                  <span>Biaya transport</span>
                  <span>Rp {Number(mua.transportFlatFee || 0).toLocaleString('id-ID')}</span>
                </div>
              )}
              <div className="border-t pt-2 mt-2 flex justify-between font-semibold text-gray-800">
                <span>Total</span>
                <span className="text-pink-500">Rp {totalPrice().toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>
        )}

        {/* Tombol Submit */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50"
        >
          {submitting ? 'Memproses...' : 'Buat Booking'}
        </button>

      </div>
    </div>
  )
}

export default BookingPage