import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { bookingAPI, paymentAPI } from '../services/api'

const PaymentPage = () => {
  const { bookingId } = useParams()
  const navigate = useNavigate()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await bookingAPI.getBookingById(bookingId)
        setBooking(res.data.data)
      } catch {
        setError('Booking tidak ditemukan')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [bookingId])

  const handlePay = async () => {
    setPaying(true)
    setError('')
    try {
      // Minta backend buat transaksi Midtrans, dapat token
      const res = await paymentAPI.createPayment(bookingId)
      const { token } = res.data.data

      // Buka popup Midtrans pakai token yang didapat
      // window.snap adalah library Midtrans yang kita load di index.html
      window.snap.pay(token, {
        onSuccess: () => {
          // Dipanggil kalau pembayaran berhasil
          navigate(`/bookings/${bookingId}`)
        },
        onPending: () => {
          // Dipanggil kalau pembayaran pending (transfer bank, dll)
          navigate(`/bookings/${bookingId}`)
        },
        onError: () => {
          setError('Pembayaran gagal, silakan coba lagi')
          setPaying(false)
        },
        onClose: () => {
          // Dipanggil kalau user tutup popup tanpa bayar
          setPaying(false)
        }
      })
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memulai pembayaran')
      setPaying(false)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-400">Memuat...</p></div>
  if (error && !booking) return <div className="min-h-screen flex items-center justify-center"><p className="text-red-400">{error}</p></div>

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-md mx-auto">

        <div className="mb-6">
          <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-700 mb-2">← Kembali</button>
          <h1 className="text-2xl font-bold text-gray-800">Pembayaran</h1>
        </div>

        {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}

        {/* Ringkasan Booking */}
        <div className="bg-white rounded-xl p-5 mb-4 shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-3">Ringkasan Pesanan</h2>
          <div className="text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">MUA</span>
              <span className="font-medium">{booking.muaProfile.brandName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Paket</span>
              <span>{booking.package.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Tanggal</span>
              <span>{new Date(booking.sessionDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Kode Booking</span>
              <span className="text-xs text-gray-400">{booking.bookingCode}</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-semibold text-gray-800">
              <span>Total Pembayaran</span>
              <span className="text-pink-500 text-lg">Rp {Number(booking.totalPrice).toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>

        {/* Info Sandbox */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-blue-700 text-sm font-medium">Mode Sandbox (Testing)</p>
          <p className="text-blue-600 text-xs mt-1">Gunakan kartu test Midtrans. Tidak ada uang sungguhan yang diproses.</p>
        </div>

        <button
          onClick={handlePay}
          disabled={paying}
          className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50"
        >
          {paying ? 'Membuka halaman pembayaran...' : `Bayar Rp ${Number(booking?.totalPrice).toLocaleString('id-ID')}`}
        </button>

      </div>
    </div>
  )
}

export default PaymentPage