import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { bookingAPI, reviewAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

const STATUS_LABEL = {
  pending: 'Menunggu Konfirmasi',
  confirmed: 'Dikonfirmasi',
  paid: 'Dibayar',
  ongoing: 'Berlangsung',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
  rejected: 'Ditolak'
}

const STATUS_COLOR = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  paid: 'bg-purple-100 text-purple-800',
  ongoing: 'bg-indigo-100 text-indigo-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-800',
  rejected: 'bg-red-100 text-red-800'
}

export default function BookingDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // State form review
  const [rating, setRating] = useState(0)
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [reviewSuccess, setReviewSuccess] = useState('')
  const [reviewError, setReviewError] = useState('')

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await bookingAPI.getBookingById(id)
        setBooking(res.data.data)
      } catch {
        setError('Gagal memuat detail booking.')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [id])

  const handleReview = async (e) => {
    e.preventDefault()
    if (rating === 0) return setReviewError('Pilih rating bintang terlebih dahulu.')
    setSubmitting(true)
    setReviewError('')
    try {
      await reviewAPI.createReview({ bookingId: booking.id, rating, content })
      setReviewSuccess('Review berhasil dikirim! Terima kasih.')
      // Refresh data booking
      const res = await bookingAPI.getBookingById(id)
      setBooking(res.data.data)
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Gagal mengirim review.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Memuat...</div>
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>
  if (!booking) return null

  const sudahReview = booking.review !== null && booking.review !== undefined
  const bisaReview = user?.role === 'client' && booking.status === 'completed' && !sudahReview

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Tombol kembali */}
        <button onClick={() => navigate(user?.role === 'mua' ? '/mua/bookings' : '/bookings')} className="text-pink-500 text-sm hover:underline">
          ← Kembali ke {user?.role === 'mua' ? 'Daftar Booking' : 'Riwayat Booking'}
        </button>

        {/* Header */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-gray-400 mb-1">Kode Booking</p>
              <p className="font-mono font-semibold text-gray-800">{booking.bookingCode}</p>
            </div>
            <span className={`text-xs font-medium px-3 py-1 rounded-full ${STATUS_COLOR[booking.status]}`}>
              {STATUS_LABEL[booking.status]}
            </span>
          </div>
        </div>

        {/* Detail Layanan */}
        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-3">
          <h2 className="font-semibold text-gray-800">Detail Layanan</h2>
          <div className="text-sm text-gray-600 space-y-2">
            <div className="flex justify-between"><span>MUA</span><span className="font-medium text-gray-800">{booking.muaProfile?.brandName}</span></div>
            <div className="flex justify-between"><span>Paket</span><span className="font-medium text-gray-800">{booking.package?.name}</span></div>
            <div className="flex justify-between"><span>Tanggal Sesi</span><span className="font-medium text-gray-800">{new Date(booking.sessionDate).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
            <div className="flex justify-between"><span>Waktu</span><span className="font-medium text-gray-800">{booking.sessionStart}</span></div>
            <div className="flex justify-between"><span>Lokasi</span><span className="font-medium text-gray-800 text-right max-w-[60%]">{booking.sessionLocation}</span></div>
            {booking.clientNotes && <div className="pt-2 border-t"><p className="text-gray-400 text-xs mb-1">Catatan</p><p>{booking.clientNotes}</p></div>}
          </div>
        </div>

        {/* Rincian Harga */}
        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-3">
          <h2 className="font-semibold text-gray-800">Rincian Harga</h2>
          <div className="text-sm text-gray-600 space-y-2">
            <div className="flex justify-between"><span>Harga Paket</span><span>Rp {Number(booking.basePrice).toLocaleString('id-ID')}</span></div>
            <div className="flex justify-between"><span>Add-on</span><span>Rp {Number(booking.addonsPrice).toLocaleString('id-ID')}</span></div>
            <div className="flex justify-between"><span>Biaya Transport</span><span>Rp {Number(booking.transportFee).toLocaleString('id-ID')}</span></div>
            <div className="flex justify-between font-semibold text-gray-800 border-t pt-2">
              <span>Total</span><span>Rp {Number(booking.totalPrice).toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>

        {/* Tombol Bayar (kalau confirmed) */}
        {booking.status === 'confirmed' && user?.role === 'client' && (
          <button
            onClick={() => navigate(`/payment/${booking.id}`)}
            className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 rounded-2xl transition"
          >
            Bayar Sekarang
          </button>
        )}

        {/* Review yang sudah ada */}
        {sudahReview && (
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-2">
            <h2 className="font-semibold text-gray-800">Ulasanmu</h2>
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map(s => (
                <span key={s} className={s <= booking.review.rating ? 'text-yellow-400' : 'text-gray-200'}>★</span>
              ))}
            </div>
            {booking.review.content && <p className="text-sm text-gray-600">{booking.review.content}</p>}
            {booking.review.muaReply && (
              <div className="bg-pink-50 rounded-xl p-3 mt-2">
                <p className="text-xs text-pink-400 font-medium mb-1">Balasan MUA</p>
                <p className="text-sm text-gray-700">{booking.review.muaReply}</p>
              </div>
            )}
          </div>
        )}

        {/* Form review baru */}
        {bisaReview && (
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-gray-800">Berikan Ulasan</h2>
            <form onSubmit={handleReview} className="space-y-4">
              {/* Bintang */}
              <div>
                <p className="text-sm text-gray-500 mb-2">Rating</p>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRating(s)}
                      className={`text-3xl transition ${s <= rating ? 'text-yellow-400' : 'text-gray-200 hover:text-yellow-300'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              {/* Ulasan teks */}
              <div>
                <label className="text-sm text-gray-500 block mb-1">Ulasan (opsional)</label>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  rows={3}
                  placeholder="Ceritakan pengalamanmu..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                />
              </div>

              {reviewError && <p className="text-red-500 text-sm">{reviewError}</p>}
              {reviewSuccess && <p className="text-green-500 text-sm">{reviewSuccess}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50"
              >
                {submitting ? 'Mengirim...' : 'Kirim Ulasan'}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  )
}