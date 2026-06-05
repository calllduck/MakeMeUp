import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { bookingAPI } from '../services/api'

const statusLabel = {
  pending: { text: 'Menunggu Konfirmasi MUA', color: 'bg-yellow-100 text-yellow-700' },
  confirmed: { text: 'Dikonfirmasi — Silakan Bayar', color: 'bg-blue-100 text-blue-700' },
  paid: { text: 'Sudah Dibayar', color: 'bg-green-100 text-green-700' },
  ongoing: { text: 'Sedang Berlangsung', color: 'bg-purple-100 text-purple-700' },
  completed: { text: 'Selesai', color: 'bg-gray-100 text-gray-700' },
  cancelled: { text: 'Dibatalkan', color: 'bg-red-100 text-red-700' },
  rejected: { text: 'Ditolak', color: 'bg-red-100 text-red-700' },
}

const BookingDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [responding, setResponding] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectForm, setShowRejectForm] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await bookingAPI.getBookingById(id)
        setBooking(res.data.data)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [id])

  const handleRespond = async (action) => {
    setResponding(true)
    try {
      const res = await bookingAPI.respondToBooking(id, { action, rejectionReason })
      setBooking(res.data.data)
      setShowRejectForm(false)
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal merespons booking')
    } finally {
      setResponding(false)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-400">Memuat...</p></div>
  if (!booking) return <div className="min-h-screen flex items-center justify-center"><p className="text-red-400">Booking tidak ditemukan</p></div>

  const status = statusLabel[booking.status] || { text: booking.status, color: 'bg-gray-100 text-gray-700' }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">

        <div className="mb-6">
          <button onClick={() => navigate('/bookings')} className="text-sm text-gray-500 hover:text-gray-700 mb-2">← Riwayat Booking</button>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Detail Booking</h1>
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${status.color}`}>{status.text}</span>
          </div>
          <p className="text-sm text-gray-400 mt-1">{booking.bookingCode}</p>
        </div>

        {/* Info MUA & Paket */}
        <div className="bg-white rounded-xl p-5 mb-4 shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-3">Layanan</h2>
          <div className="text-sm space-y-1">
            <div className="flex justify-between"><span className="text-gray-500">MUA</span><span className="font-medium">{booking.muaProfile.brandName}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Paket</span><span>{booking.package.name}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Tanggal</span><span>{new Date(booking.sessionDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Jam mulai</span><span>{booking.sessionStart}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Lokasi</span><span className="text-right max-w-xs">{booking.sessionLocation}</span></div>
            {booking.clientNotes && <div className="flex justify-between"><span className="text-gray-500">Catatan</span><span className="text-right max-w-xs">{booking.clientNotes}</span></div>}
          </div>
        </div>

        {/* Rincian Harga */}
        <div className="bg-white rounded-xl p-5 mb-4 shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-3">Rincian Harga</h2>
          <div className="text-sm space-y-1">
            <div className="flex justify-between text-gray-600"><span>Harga paket</span><span>Rp {Number(booking.basePrice).toLocaleString('id-ID')}</span></div>
            {Number(booking.addonsPrice) > 0 && <div className="flex justify-between text-gray-600"><span>Add-on</span><span>Rp {Number(booking.addonsPrice).toLocaleString('id-ID')}</span></div>}
            {Number(booking.transportFee) > 0 && <div className="flex justify-between text-gray-600"><span>Transport</span><span>Rp {Number(booking.transportFee).toLocaleString('id-ID')}</span></div>}
            <div className="border-t pt-2 flex justify-between font-semibold text-gray-800">
              <span>Total</span>
              <span className="text-pink-500">Rp {Number(booking.totalPrice).toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>

        {/* Tombol MUA: terima/tolak */}
        {user?.role === 'mua' && booking.status === 'pending' && (
          <div className="bg-white rounded-xl p-5 mb-4 shadow-sm">
            <h2 className="font-semibold text-gray-700 mb-3">Respons Booking</h2>
            {!showRejectForm ? (
              <div className="flex gap-3">
                <button
                  onClick={() => handleRespond('accept')}
                  disabled={responding}
                  className="flex-1 bg-pink-500 hover:bg-pink-600 text-white font-medium py-2 rounded-lg transition disabled:opacity-50"
                >
                  Terima
                </button>
                <button
                  onClick={() => setShowRejectForm(true)}
                  className="flex-1 border border-red-300 text-red-500 hover:bg-red-50 font-medium py-2 rounded-lg transition"
                >
                  Tolak
                </button>
              </div>
            ) : (
              <div>
                <textarea
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                  placeholder="Alasan penolakan (opsional)"
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:border-pink-400 resize-none"
                />
                <div className="flex gap-3">
                  <button onClick={() => setShowRejectForm(false)} className="flex-1 border border-gray-200 text-gray-500 py-2 rounded-lg text-sm">Batal</button>
                  <button
                    onClick={() => handleRespond('reject')}
                    disabled={responding}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg text-sm disabled:opacity-50"
                  >
                    Konfirmasi Tolak
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tombol Bayar untuk client */}
        {user?.role === 'client' && booking.status === 'confirmed' && (
          <button
            onClick={() => navigate(`/payment/${booking.id}`)}
            className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 rounded-xl transition"
          >
            Lanjut ke Pembayaran
          </button>
        )}

      </div>
    </div>
  )
}

export default BookingDetailPage