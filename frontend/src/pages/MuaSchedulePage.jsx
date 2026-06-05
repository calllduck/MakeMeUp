import { useState, useEffect } from 'react'
import { scheduleAPI } from '../services/api'

const MuaSchedulePage = () => {
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({ date: '', startTime: '', endTime: '' })

  const fetchSchedules = async () => {
    try {
      const res = await scheduleAPI.getSchedules()
      setSchedules(res.data.data)
    } catch (err) {
      setError('Gagal memuat jadwal')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSchedules() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await scheduleAPI.createSchedule(form)
      setSuccess('Jadwal berhasil ditambahkan!')
      setForm({ date: '', startTime: '', endTime: '' })
      fetchSchedules()
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menambah jadwal')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Hapus jadwal ini?')) return
    try {
      await scheduleAPI.deleteSchedule(id)
      setSuccess('Jadwal berhasil dihapus')
      fetchSchedules()
    } catch (err) {
      setError('Gagal menghapus jadwal')
    }
  }

  const handleToggleBlock = async (id) => {
    try {
      await scheduleAPI.toggleBlock(id)
      fetchSchedules()
    } catch (err) {
      setError('Gagal mengubah status jadwal')
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-400">Memuat...</p></div>

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Kelola Jadwal</h1>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4">{error}</div>}
        {success && <div className="bg-green-50 text-green-600 p-3 rounded mb-4">{success}</div>}

        {/* Form Tambah Jadwal */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Tambah Slot Waktu</h2>
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Tanggal</label>
              <input className="w-full border rounded-lg p-2 text-sm" type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Mulai</label>
                <input className="w-full border rounded-lg p-2 text-sm" type="time" value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})} required />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Selesai</label>
                <input className="w-full border rounded-lg p-2 text-sm" type="time" value={form.endTime} onChange={e => setForm({...form, endTime: e.target.value})} required />
              </div>
            </div>
            <button type="submit" className="w-full bg-pink-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-pink-600 transition">Tambah Jadwal</button>
          </form>
        </div>

        {/* Daftar Jadwal */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Jadwal Saya</h2>
          {schedules.length === 0 ? (
            <p className="text-gray-400 text-sm">Belum ada jadwal. Tambahkan slot waktu pertamamu!</p>
          ) : (
            <div className="space-y-2">
              {schedules.map(schedule => (
                <div key={schedule.id} className={`border rounded-lg p-3 flex justify-between items-center ${schedule.isBlocked ? 'bg-gray-50 opacity-60' : ''}`}>
                  <div>
                    <p className="font-medium text-gray-800 text-sm">
                      {new Date(schedule.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <p className="text-gray-500 text-sm">{schedule.startTime} – {schedule.endTime}</p>
                    {schedule.isBlocked && <span className="text-xs text-red-400">Diblokir</span>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleToggleBlock(schedule.id)} className={`text-xs px-3 py-1 rounded-full border ${schedule.isBlocked ? 'text-green-600 border-green-300 hover:bg-green-50' : 'text-orange-500 border-orange-300 hover:bg-orange-50'}`}>
                      {schedule.isBlocked ? 'Buka' : 'Blokir'}
                    </button>
                    <button onClick={() => handleDelete(schedule.id)} className="text-xs px-3 py-1 rounded-full border text-red-400 border-red-300 hover:bg-red-50">Hapus</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MuaSchedulePage