import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { bookingAPI } from '../services/api'

const statusLabel = {
  pending: { text: 'Menunggu Konfirmasi', color: 'bg-yellow-100 text-yellow-700' },
  confirmed: { text: 'Dikonfirmasi', color: 'bg-blue-100 text-blue-700' },
  paid: { text: 'Sudah Dibayar', color: 'bg-green-100 text-green-700' },
  ongoing: { text: 'Sedang Berlangsung', color: 'bg-purple-100 text-purple-700' },
  completed: { text: 'Selesai', color: 'bg-gray-100 text-gray-700' },
  cancelled: { text: 'Dibatalkan', color: 'bg-red-100 text-red-700' },
  rejected: { text: 'Ditolak', color: 'bg-red-100 text-red-700' },
}

const BookingHistoryPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [responding, setResponding] = useState(null)

  const isMua = user?.role === 'mua'

  const fetchBookings = async () => {
    try {
      const res = await bookingAPI.getBookings()
      setBookings(res.data.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchBookings() }, [])

  const handleRespond = async (e, bookingId, action) => {
    e.stopPropagation()
    setResponding(bookingId)
    try {
      await bookingAPI.respondToBooking(bookingId, { action })
      await fetchBookings()
    } catch {
      alert('Gagal memproses. Coba lagi.')
    } finally {
      setResponding(null)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400">Memuat...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          {isMua ? 'Daftar Booking' : 'Riwayat Booking'}
        </h1>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center shadow-sm">
            <p className="text-gray-400">Belum ada booking</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map(booking => {
              const status = statusLabel[booking.status] || { text: booking.status, color: 'bg-gray-100 text-gray-700' }
              const isPending = booking.status === 'pending'

              return (
                <div
                  key={booking.id}
                  onClick={() => navigate(isMua ? `/mua/bookings/${booking.id}` : `/bookings/${booking.id}`)}
                  className="bg-white rounded-xl p-4 shadow-sm cursor-pointer hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      {isMua ? (
                        <>
                          <p className="font-semibold text-gray-800">{booking.client?.name}</p>
                          <p className="text-sm text-gray-500">{booking.package?.name}</p>
                        </>
                      ) : (
                        <>
                          <p className="font-semibold text-gray-800">{booking.muaProfile?.brandName}</p>
                          <p className="text-sm text-gray-500">{booking.package?.name}</p>
                        </>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${status.color}`}>
                      {status.text}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>{new Date(booking.sessionDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    <span className="font-medium text-gray-700">Rp {Number(booking.totalPrice).toLocaleString('id-ID')}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{booking.bookingCode}</p>

                  {isMua && isPending && (
                    <div className="flex gap-2 mt-3" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={(e) => handleRespond(e, booking.id, 'accept')}
                        disabled={responding === booking.id}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm font-medium py-2 rounded-lg transition disabled:opacity-50"
                      >
                        {responding === booking.id ? 'Memproses...' : 'Terima'}
                      </button>
                      <button
                        onClick={(e) => handleRespond(e, booking.id, 'reject')}
                        disabled={responding === booking.id}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm font-medium py-2 rounded-lg transition disabled:opacity-50"
                      >
                        {responding === booking.id ? 'Memproses...' : 'Tolak'}
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default BookingHistoryPage