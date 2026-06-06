import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { bookingAPI } from '../services/api'
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

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await bookingAPI.getBookings()
        setBookings(res.data.data)
      } catch {
        // gagal load
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  const pending = bookings.filter(b => b.status === 'pending')
  const upcoming = bookings.filter(b => ['confirmed', 'paid'].includes(b.status))

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Greeting */}
        <div className="bg-gradient-to-br from-pink-50 to-white rounded-2xl p-6 shadow-sm">
          <h1 className="text-xl font-bold text-gray-800">
            Halo! 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">Ini ringkasan aktivitas booking kamu hari ini.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Perlu Respons', value: pending.length, color: 'text-yellow-500' },
            { label: 'Upcoming', value: upcoming.length, color: 'text-blue-500' },
            { label: 'Total Booking', value: bookings.length, color: 'text-pink-500' },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-2xl p-4 shadow-sm text-center">
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Booking perlu respons */}
        {pending.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-3">
            <h2 className="font-semibold text-gray-800">⏳ Perlu Responmu</h2>
            {pending.map(b => (
              <button
                key={b.id}
                onClick={() => navigate(`/mua/bookings/${b.id}`)}
                className="w-full text-left border border-yellow-200 bg-yellow-50 rounded-xl p-4 hover:bg-yellow-100 transition"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{b.bookingCode}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(b.sessionDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                  </div>
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Pending</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Quick links */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: '📋 Kelola Paket', to: '/mua/packages' },
            { label: '📅 Atur Jadwal', to: '/mua/schedules' },
            { label: '💬 Inbox', to: '/inbox' },
            { label: '👤 Edit Profil', to: '/profile/mua' },
          ].map(item => (
            <button
              key={item.to}
              onClick={() => navigate(item.to)}
              className="bg-white rounded-2xl p-4 shadow-sm text-sm font-medium text-gray-700 hover:shadow-md transition text-left"
            >
              {item.label}
            </button>
          ))}
        </div>

      </div>
    </div>
  )
}