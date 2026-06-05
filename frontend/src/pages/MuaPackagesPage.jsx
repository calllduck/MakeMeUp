import { useState, useEffect } from 'react'
import { packageAPI } from '../services/api'

const MuaPackagesPage = () => {
  const [packages, setPackages] = useState([])
  const [addons, setAddons] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form paket baru
  const [pkgForm, setPkgForm] = useState({
    name: '', description: '', basePrice: '',
    durationMinutes: '', includedServices: ''
  })

  // Form add-on baru
  const [addonForm, setAddonForm] = useState({ name: '', description: '', price: '' })

  const fetchData = async () => {
    try {
      const [pkgRes, addonRes] = await Promise.all([
        packageAPI.getPackages(),
        packageAPI.getAddons()
      ])
      setPackages(pkgRes.data.data)
      setAddons(addonRes.data.data)
    } catch (err) {
      setError('Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleCreatePackage = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await packageAPI.createPackage({
        ...pkgForm,
        basePrice: parseFloat(pkgForm.basePrice),
        durationMinutes: parseInt(pkgForm.durationMinutes),
        // includedServices dikirim sebagai array, dipisah koma
        includedServices: pkgForm.includedServices.split(',').map(s => s.trim())
      })
      setSuccess('Paket berhasil dibuat!')
      setPkgForm({ name: '', description: '', basePrice: '', durationMinutes: '', includedServices: '' })
      fetchData()
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal membuat paket')
    }
  }

  const handleDeletePackage = async (id) => {
    if (!confirm('Hapus paket ini?')) return
    try {
      await packageAPI.deletePackage(id)
      setSuccess('Paket berhasil dihapus')
      fetchData()
    } catch (err) {
      setError('Gagal menghapus paket')
    }
  }

  const handleCreateAddon = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await packageAPI.createAddon({
        ...addonForm,
        price: parseFloat(addonForm.price)
      })
      setSuccess('Add-on berhasil dibuat!')
      setAddonForm({ name: '', description: '', price: '' })
      fetchData()
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal membuat add-on')
    }
  }

  const handleDeleteAddon = async (id) => {
    if (!confirm('Hapus add-on ini?')) return
    try {
      await packageAPI.deleteAddon(id)
      setSuccess('Add-on berhasil dihapus')
      fetchData()
    } catch (err) {
      setError('Gagal menghapus add-on')
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-400">Memuat...</p></div>

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Kelola Paket Layanan</h1>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4">{error}</div>}
        {success && <div className="bg-green-50 text-green-600 p-3 rounded mb-4">{success}</div>}

        {/* Form Buat Paket */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Tambah Paket Baru</h2>
          <form onSubmit={handleCreatePackage} className="space-y-3">
            <input className="w-full border rounded-lg p-2 text-sm" placeholder="Nama paket (contoh: Paket Basic)" value={pkgForm.name} onChange={e => setPkgForm({...pkgForm, name: e.target.value})} required />
            <input className="w-full border rounded-lg p-2 text-sm" placeholder="Deskripsi (opsional)" value={pkgForm.description} onChange={e => setPkgForm({...pkgForm, description: e.target.value})} />
            <div className="grid grid-cols-2 gap-3">
              <input className="border rounded-lg p-2 text-sm" placeholder="Harga dasar (Rp)" type="number" value={pkgForm.basePrice} onChange={e => setPkgForm({...pkgForm, basePrice: e.target.value})} required />
              <input className="border rounded-lg p-2 text-sm" placeholder="Durasi (menit)" type="number" value={pkgForm.durationMinutes} onChange={e => setPkgForm({...pkgForm, durationMinutes: e.target.value})} required />
            </div>
            <input className="w-full border rounded-lg p-2 text-sm" placeholder="Layanan yang termasuk, pisah koma (contoh: Foundation, Eyebrow, Lip color)" value={pkgForm.includedServices} onChange={e => setPkgForm({...pkgForm, includedServices: e.target.value})} required />
            <button type="submit" className="w-full bg-pink-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-pink-600 transition">Buat Paket</button>
          </form>
        </div>

        {/* Daftar Paket */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Paket Saya ({packages.length}/5)</h2>
          {packages.length === 0 ? (
            <p className="text-gray-400 text-sm">Belum ada paket. Buat paket pertamamu!</p>
          ) : (
            <div className="space-y-3">
              {packages.map(pkg => (
                <div key={pkg.id} className="border rounded-lg p-4 flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-800">{pkg.name}</p>
                    <p className="text-sm text-gray-500">{pkg.description}</p>
                    <p className="text-sm text-pink-600 font-medium mt-1">Rp {parseInt(pkg.basePrice).toLocaleString('id-ID')} · {pkg.durationMinutes} menit</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {pkg.includedServices.map((s, i) => (
                        <span key={i} className="bg-pink-50 text-pink-600 text-xs px-2 py-0.5 rounded-full">{s}</span>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => handleDeletePackage(pkg.id)} className="text-red-400 hover:text-red-600 text-sm ml-4">Hapus</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Form Add-on */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Tambah Add-on</h2>
          <form onSubmit={handleCreateAddon} className="space-y-3">
            <input className="w-full border rounded-lg p-2 text-sm" placeholder="Nama add-on (contoh: Eyelash Extension)" value={addonForm.name} onChange={e => setAddonForm({...addonForm, name: e.target.value})} required />
            <input className="w-full border rounded-lg p-2 text-sm" placeholder="Deskripsi (opsional)" value={addonForm.description} onChange={e => setAddonForm({...addonForm, description: e.target.value})} />
            <input className="w-full border rounded-lg p-2 text-sm" placeholder="Harga tambahan (Rp)" type="number" value={addonForm.price} onChange={e => setAddonForm({...addonForm, price: e.target.value})} required />
            <button type="submit" className="w-full bg-pink-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-pink-600 transition">Tambah Add-on</button>
          </form>
        </div>

        {/* Daftar Add-on */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Add-on Saya</h2>
          {addons.length === 0 ? (
            <p className="text-gray-400 text-sm">Belum ada add-on.</p>
          ) : (
            <div className="space-y-2">
              {addons.map(addon => (
                <div key={addon.id} className="border rounded-lg p-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{addon.name}</p>
                    <p className="text-pink-600 text-sm">+Rp {parseInt(addon.price).toLocaleString('id-ID')}</p>
                  </div>
                  <button onClick={() => handleDeleteAddon(addon.id)} className="text-red-400 hover:text-red-600 text-sm">Hapus</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MuaPackagesPage