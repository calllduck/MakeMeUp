import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { profileAPI, packageAPI, scheduleAPI, bookingAPI, portfolioAPI } from '../services/api'

const formatIDR = (amount) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount)

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

const SPECIALIZATIONS = ['Bridal', 'Wisuda', 'Editorial', 'Theatrical', 'Korean', 'Natural', 'Glam', 'Airbrush', 'SFX']
const MAKEUP_STYLES   = ['Natural/No-makeup look', 'Glam', 'Korean', 'Editorial', 'Bridal', 'Theatrical']
const INGREDIENTS     = ['niacinamide', 'hyaluronic acid', 'glycerin', 'ceramide', 'retinol', 'AHA/BHA', 'fragrance', 'paraben']

const MuaDashboard = () => {
  const { user } = useAuth()
  const [tab, setTab] = useState('overview')

  // ── Booking state ──
  const [bookings, setBookings]             = useState([])
  const [bookLoading, setBookLoading]       = useState(true)
  const [rejectModal, setRejectModal]       = useState(null)
  const [rejectReason, setRejectReason]     = useState('')
  const [respondLoading, setRespondLoading] = useState(false)

  // ── Package state ──
  const [pkgs, setPkgs]             = useState([])
  const [addons, setAddons]         = useState([])
  const [pkgLoading, setPkgLoading] = useState(false)
  const [pkgModal, setPkgModal]     = useState(null)
  const [addonModal, setAddonModal] = useState(false)
  const [pkgForm, setPkgForm]       = useState({
    name: '', description: '', basePrice: '', durationMinutes: '', includedServices: '', sortOrder: 0
  })
  const [addonForm, setAddonForm] = useState({ name: '', price: '', description: '' })
  const [pkgSaving, setPkgSaving] = useState(false)

  // ── Schedule state ──
  const [schedules, setSchedules]   = useState([])
  const [schLoading, setSchLoading] = useState(false)
  const [schForm, setSchForm]       = useState({ date: '', startTime: '', endTime: '' })
  const [schSaving, setSchSaving]   = useState(false)
  const [schError, setSchError]     = useState('')

  // ── Profile state ──
  const [profile, setProfile]         = useState(null)
  const [profLoading, setProfLoading] = useState(false)
  const [profSaving, setProfSaving]   = useState(false)
  const [profSuccess, setProfSuccess] = useState('')
  const [profError, setProfError]     = useState('')
  const [profForm, setProfForm]       = useState({
    brandName: '', bio: '', operationalLocation: '', yearsExperience: '',
    specializations: [], makeupStyles: [],
    canUseOwnSkinprep: true, canUseClientSkinprep: true,
    ownSkinprepIngredients: [],
    transportType: 'per_km', transportFlatFee: '', transportPerKmRate: '',
    customIngredient: ''
  })

  // ── Portfolio state ──
  const [portfolio, setPortfolio]       = useState([])
  const [portoLoading, setPortoLoading] = useState(false)
  const [uploading, setUploading]       = useState(false)
  const [uploadError, setUploadError]   = useState('')
  const [caption, setCaption]           = useState('')
  const [style, setStyle]               = useState('')
  const fileInputRef                    = useRef(null)

  // ── Fetch on mount ──
  useEffect(() => { fetchBookings() }, [])

  useEffect(() => {
    if (tab === 'packages'  && pkgs.length === 0)      fetchPackages()
    if (tab === 'schedule'  && schedules.length === 0)  fetchSchedules()
    if (tab === 'profile'   && !profile)                fetchProfile()
    if (tab === 'portfolio' && portfolio.length === 0)  fetchPortfolio()
  }, [tab])

  // ── Fetchers ──
  const fetchBookings = async () => {
    setBookLoading(true)
    try {
      const res = await bookingAPI.getBookings()
      setBookings(res.data.data)
    } catch { } finally { setBookLoading(false) }
  }

  const fetchPackages = async () => {
    setPkgLoading(true)
    try {
      const [pkgRes, addonRes] = await Promise.all([
        packageAPI.getPackages(),
        packageAPI.getAddons(),
      ])
      setPkgs(pkgRes.data.data)
      setAddons(addonRes.data.data)
    } catch { } finally { setPkgLoading(false) }
  }

  const fetchSchedules = async () => {
    setSchLoading(true)
    try {
      const res = await scheduleAPI.getSchedules()
      setSchedules(res.data.data)
    } catch { } finally { setSchLoading(false) }
  }

  const fetchProfile = async () => {
    setProfLoading(true)
    try {
      const res = await profileAPI.getMuaProfile()
      const p   = res.data.data
      setProfile(p)
      if (p) {
        setProfForm(f => ({
          ...f,
          brandName:              p.brandName              || '',
          bio:                    p.bio                    || '',
          operationalLocation:    p.operationalLocation    || '',
          yearsExperience:        p.yearsExperience        || '',
          specializations:        p.specializations        || [],
          makeupStyles:           p.makeupStyles           || [],
          canUseOwnSkinprep:      p.canUseOwnSkinprep      ?? true,
          canUseClientSkinprep:   p.canUseClientSkinprep   ?? true,
          ownSkinprepIngredients: p.ownSkinprepIngredients || [],
          transportType:          p.transportType          || 'per_km',
          transportFlatFee:       p.transportFlatFee       || '',
          transportPerKmRate:     p.transportPerKmRate     || '',
        }))
      }
    } catch { } finally { setProfLoading(false) }
  }

  const fetchPortfolio = async () => {
    setPortoLoading(true)
    try {
      // Ambil muaProfileId dari profil dulu
      const profRes = await profileAPI.getMuaProfile()
      const p = profRes.data.data
      if (!p) return
      const res = await portfolioAPI.getPortfolio(p.id)
      setPortfolio(res.data.data)
    } catch { } finally { setPortoLoading(false) }
  }

  // ── Respond booking ──
  const handleRespond = async (id, action) => {
    if (action === 'reject') { setRejectModal(id); return }
    setRespondLoading(true)
    try {
      await bookingAPI.respondToBooking(id, { action: 'accept' })
      fetchBookings()
    } catch { } finally { setRespondLoading(false) }
  }

  const handleConfirmReject = async () => {
    setRespondLoading(true)
    try {
      await bookingAPI.respondToBooking(rejectModal, { action: 'reject', rejectionReason: rejectReason })
      setRejectModal(null)
      setRejectReason('')
      fetchBookings()
    } catch { } finally { setRespondLoading(false) }
  }

  // ── Save package ──
  const handleSavePkg = async () => {
    if (!profile) {
      alert('Lengkapi profil MUA kamu dulu sebelum menambah paket! Pergi ke tab Profil.')
      setTab('profile')
      return
    }
    setPkgSaving(true)
    try {
      const data = {
        ...pkgForm,
        basePrice:        Number(pkgForm.basePrice),
        durationMinutes:  Number(pkgForm.durationMinutes),
        includedServices: pkgForm.includedServices.split('\n').map(s => s.trim()).filter(Boolean),
      }
      if (pkgModal === 'new') {
        await packageAPI.createPackage(data)
      } else {
        await packageAPI.updatePackage(pkgModal.id, data)
      }
      setPkgModal(null)
      fetchPackages()
    } catch { } finally { setPkgSaving(false) }
  }

  // ── Save addon ──
  const handleSaveAddon = async () => {
    setPkgSaving(true)
    try {
      await packageAPI.createAddon({
        name:        addonForm.name,
        price:       Number(addonForm.price),
        description: addonForm.description,
      })
      setAddonModal(false)
      setAddonForm({ name: '', price: '', description: '' })
      fetchPackages()
    } catch { } finally { setPkgSaving(false) }
  }

  // ── Save schedule ──
  const handleSaveSchedule = async () => {
    setSchError('')
    if (!schForm.date || !schForm.startTime || !schForm.endTime) {
      return setSchError('Tanggal, jam mulai, dan jam selesai wajib diisi.')
    }
    setSchSaving(true)
    try {
      await scheduleAPI.createSchedule(schForm)
      setSchForm({ date: '', startTime: '', endTime: '' })
      fetchSchedules()
    } catch (err) {
      setSchError(err.response?.data?.message || 'Gagal menyimpan jadwal.')
    } finally { setSchSaving(false) }
  }

  const handleDeleteSchedule = async (id) => {
    try { await scheduleAPI.deleteSchedule(id); fetchSchedules() } catch { }
  }

  const handleToggleBlock = async (id) => {
    try { await scheduleAPI.toggleBlock(id); fetchSchedules() } catch { }
  }

  // ── Save profile ──
  const handleSaveProfile = async () => {
    setProfSaving(true)
    setProfError('')
    setProfSuccess('')
    try {
      const { customIngredient, ...data } = profForm
      if (data.yearsExperience)   data.yearsExperience   = Number(data.yearsExperience)
      if (data.transportFlatFee)  data.transportFlatFee  = Number(data.transportFlatFee)
      if (data.transportPerKmRate) data.transportPerKmRate = Number(data.transportPerKmRate)
      await profileAPI.updateMuaProfile(data)
      setProfSuccess('Profil berhasil disimpan!')
      setTimeout(() => setProfSuccess(''), 3000)
      fetchProfile()
    } catch (err) {
      setProfError(err.response?.data?.message || 'Gagal menyimpan profil.')
    } finally { setProfSaving(false) }
  }

  // ── Upload foto portofolio ──
  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadError('')
    try {
      // FormData digunakan karena kita kirim file, bukan JSON biasa
      const formData = new FormData()
      formData.append('photo', file)
      if (caption) formData.append('caption', caption)
      if (style)   formData.append('style', style)
      await portfolioAPI.upload(formData)
      setCaption('')
      setStyle('')
      fetchPortfolio()
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Gagal upload foto.')
    } finally {
      setUploading(false)
      // Reset input supaya foto yang sama bisa diupload lagi kalau perlu
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDeletePhoto = async (photoId) => {
    try { await portfolioAPI.delete(photoId); fetchPortfolio() } catch { }
  }

  const toggleArr = (key, val, setter) => {
    setter(f => ({
      ...f,
      [key]: f[key].includes(val) ? f[key].filter(x => x !== val) : [...f[key], val]
    }))
  }

  // ── Derived ──
  const pending  = bookings.filter(b => b.status === 'pending')
  const earnings = bookings
    .filter(b => ['confirmed', 'completed', 'paid', 'ongoing'].includes(b.status))
    .reduce((s, b) => s + Number(b.totalPrice), 0)

  return (
    <div className="pt-16 min-h-screen bg-[#fafafa]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Dashboard MUA 💄</h1>
            <p className="text-gray-400 text-sm mt-0.5">{user?.name}</p>
          </div>
          {pending.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 flex items-center gap-2">
              <span className="text-amber-600 font-black text-lg">{pending.length}</span>
              <span className="text-xs font-semibold text-amber-700">booking menunggu</span>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total Booking',    value: bookings.length,                                       icon: '📋', color: 'bg-violet-50 text-violet-700' },
            { label: 'Menunggu',         value: pending.length,                                        icon: '⏳', color: 'bg-amber-50 text-amber-700'  },
            { label: 'Selesai',          value: bookings.filter(b => b.status === 'completed').length, icon: '✅', color: 'bg-green-50 text-green-700'  },
            { label: 'Total Pendapatan', value: formatIDR(earnings),                                   icon: '💰', color: 'bg-pink-50 text-[#f6339a]'   },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4">
              <div className={`w-9 h-9 rounded-xl ${s.color} flex items-center justify-center text-lg mb-3`}>{s.icon}</div>
              <div className="text-lg font-black text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-400">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tab nav */}
        <div className="flex bg-white rounded-2xl border border-gray-100 p-1 mb-6 gap-1 overflow-x-auto">
          {[
            ['overview',   '📊 Overview'],
            ['bookings',   '📋 Booking'],
            ['packages',   '📦 Paket'],
            ['schedule',   '📅 Jadwal'],
            ['portfolio',  '🖼 Portofolio'],
            ['profile',    '🎨 Profil'],
          ].map(([t, l]) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`shrink-0 flex-1 py-2.5 px-3 text-sm font-bold rounded-xl transition-all ${
                tab === t ? 'bg-[#f6339a] text-white shadow-sm' : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        {/* ── Overview ── */}
        {tab === 'overview' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h2 className="font-bold text-gray-900 mb-4">Booking Terbaru</h2>
              {bookLoading ? (
                <p className="text-sm text-gray-400 py-4 text-center">Memuat...</p>
              ) : bookings.length === 0 ? (
                <p className="text-sm text-gray-400 py-4 text-center">Belum ada booking masuk</p>
              ) : (
                bookings.slice(0, 3).map(b => (
                  <div key={b.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{b.client?.name || 'Klien'}</p>
                      <p className="text-xs text-gray-400">
                        {b.package?.name} · {new Date(b.sessionDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-900">{formatIDR(b.totalPrice)}</span>
                      <StatusBadge status={b.status} />
                    </div>
                  </div>
                ))
              )}
              <button onClick={() => setTab('bookings')} className="mt-3 text-xs text-[#f6339a] font-semibold hover:underline">
                Lihat semua →
              </button>
            </div>

            <div className="bg-[#fdf2f8] rounded-2xl border border-[#f6339a]/10 p-5">
              <h3 className="font-bold text-gray-900 mb-2">Tips Tingkatkan Booking 🚀</h3>
              <ul className="space-y-2 text-xs text-gray-600">
                {[
                  'Lengkapi portofolio minimal 10 foto',
                  'Update jadwal setiap awal bulan',
                  'Balas pesan klien dalam 1 jam',
                  'Isi profil skinprep untuk filter kulit',
                ].map(tip => (
                  <li key={tip} className="flex items-start gap-2">
                    <span className="text-[#f6339a] mt-0.5">→</span> {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* ── Bookings ── */}
        {tab === 'bookings' && (
          <div className="space-y-3">
            {bookLoading ? (
              <div className="text-center py-16 text-gray-400 text-sm">Memuat booking...</div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <div className="text-4xl mb-3">📭</div>
                <p className="font-semibold">Belum ada booking masuk</p>
              </div>
            ) : (
              bookings.map(b => (
                <div key={b.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-gray-900">{b.client?.name || 'Klien'}</h3>
                        <StatusBadge status={b.status} />
                      </div>
                      <p className="text-xs text-gray-400 font-mono mt-0.5">{b.bookingCode}</p>
                    </div>
                    <p className="font-black text-[#f6339a] text-lg shrink-0">{formatIDR(b.totalPrice)}</p>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-2 text-xs text-gray-500 mb-2">
                    <span>📦 {b.package?.name}</span>
                    <span>📅 {new Date(b.sessionDate).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                    <span>⏰ {b.sessionStart}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">📍 {b.sessionLocation}</p>
                  {b.clientNotes && (
                    <div className="mb-3 bg-gray-50 rounded-xl px-3 py-2 text-xs text-gray-600">
                      <span className="font-semibold">Catatan klien: </span>{b.clientNotes}
                    </div>
                  )}
                  {b.status === 'pending' && (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleRespond(b.id, 'accept')}
                        disabled={respondLoading}
                        className="flex-1 bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white font-bold py-2.5 rounded-xl text-sm transition-colors"
                      >
                        ✓ Terima
                      </button>
                      <button
                        onClick={() => handleRespond(b.id, 'reject')}
                        disabled={respondLoading}
                        className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2.5 rounded-xl text-sm border border-red-200 transition-colors"
                      >
                        ✕ Tolak
                      </button>
                    </div>
                  )}
                  {b.status === 'rejected' && b.rejectionReason && (
                    <div className="mt-2 bg-red-50 rounded-xl px-3 py-2 text-xs text-red-600">
                      <span className="font-semibold">Alasan penolakan: </span>{b.rejectionReason}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* ── Packages ── */}
        {tab === 'packages' && (
          <div className="space-y-5">
            {pkgLoading ? (
              <div className="text-center py-16 text-gray-400 text-sm">Memuat paket...</div>
            ) : (
              <>
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-gray-900">Paket Layanan</h2>
                    <button
                      onClick={() => { setPkgModal('new'); setPkgForm({ name: '', description: '', basePrice: '', durationMinutes: '', includedServices: '', sortOrder: 0 }) }}
                      className="text-sm font-bold text-[#f6339a] border border-[#f6339a]/30 px-4 py-2 rounded-full hover:bg-pink-50 transition-colors"
                    >
                      + Tambah Paket
                    </button>
                  </div>
                  {pkgs.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-6">Belum ada paket. Tambah paket pertamamu!</p>
                  ) : (
                    <div className="space-y-3">
                      {pkgs.map(pkg => (
                        <div key={pkg.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-[#f6339a]/20 transition-all">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-gray-900">{pkg.name}</h3>
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${pkg.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                                {pkg.isActive ? 'Aktif' : 'Nonaktif'}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5">~{pkg.durationMinutes} menit</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-black text-[#f6339a]">{formatIDR(pkg.basePrice)}</span>
                            <button
                              onClick={() => {
                                setPkgModal(pkg)
                                setPkgForm({
                                  name:             pkg.name,
                                  description:      pkg.description || '',
                                  basePrice:        pkg.basePrice,
                                  durationMinutes:  pkg.durationMinutes,
                                  includedServices: pkg.includedServices?.join('\n') || '',
                                  sortOrder:        pkg.sortOrder || 0,
                                })
                              }}
                              className="text-xs text-gray-400 hover:text-gray-700 px-3 py-1.5 border border-gray-100 rounded-lg transition-colors"
                            >
                              Edit
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-gray-900">Add-on Layanan</h2>
                    <button
                      onClick={() => setAddonModal(true)}
                      className="text-sm font-bold text-[#f6339a] border border-[#f6339a]/30 px-4 py-2 rounded-full hover:bg-pink-50 transition-colors"
                    >
                      + Tambah Add-on
                    </button>
                  </div>
                  {addons.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-6">Belum ada add-on.</p>
                  ) : (
                    <div className="space-y-2">
                      {addons.map(a => (
                        <div key={a.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100">
                          <div>
                            <span className="text-sm font-semibold text-gray-700">{a.name}</span>
                            {a.description && <p className="text-xs text-gray-400">{a.description}</p>}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-gray-800">+{formatIDR(a.price)}</span>
                            <button
                              onClick={async () => { await packageAPI.deleteAddon(a.id); fetchPackages() }}
                              className="text-xs text-red-400 hover:text-red-600 transition-colors"
                            >
                              Hapus
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Schedule ── */}
        {tab === 'schedule' && (
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h2 className="font-bold text-gray-900 mb-4">Tambah Slot Jadwal</h2>
              <div className="grid sm:grid-cols-3 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Tanggal</label>
                  <input type="date" value={schForm.date} onChange={e => setSchForm(f => ({ ...f, date: e.target.value }))}
                    className="w-full bg-gray-50 border border-gray-200 focus:border-[#f6339a] rounded-xl px-3 py-2.5 text-sm outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Jam Mulai</label>
                  <input type="time" value={schForm.startTime} onChange={e => setSchForm(f => ({ ...f, startTime: e.target.value }))}
                    className="w-full bg-gray-50 border border-gray-200 focus:border-[#f6339a] rounded-xl px-3 py-2.5 text-sm outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Jam Selesai</label>
                  <input type="time" value={schForm.endTime} onChange={e => setSchForm(f => ({ ...f, endTime: e.target.value }))}
                    className="w-full bg-gray-50 border border-gray-200 focus:border-[#f6339a] rounded-xl px-3 py-2.5 text-sm outline-none transition-all" />
                </div>
              </div>
              {schError && <p className="text-sm text-red-500 mb-3">{schError}</p>}
              <button onClick={handleSaveSchedule} disabled={schSaving}
                className="w-full bg-[#f6339a] hover:bg-[#e01f87] disabled:opacity-60 text-white font-bold py-2.5 rounded-xl text-sm transition-colors">
                {schSaving ? 'Menyimpan...' : '+ Tambah Slot'}
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h2 className="font-bold text-gray-900 mb-4">Jadwal Tersimpan</h2>
              {schLoading ? (
                <p className="text-sm text-gray-400 text-center py-6">Memuat jadwal...</p>
              ) : schedules.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">Belum ada jadwal. Tambah slot di atas!</p>
              ) : (
                <div className="space-y-2">
                  {schedules.map(s => (
                    <div key={s.id} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${s.isBlocked ? 'bg-gray-50 border-gray-200 opacity-60' : s.bookingId ? 'bg-blue-50 border-blue-100' : 'border-gray-100'}`}>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {new Date(s.date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                        <p className="text-xs text-gray-400">{s.startTime} – {s.endTime}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {s.bookingId ? (
                          <span className="text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-1 rounded-lg">Sudah dipesan</span>
                        ) : (
                          <>
                            <button onClick={() => handleToggleBlock(s.id)}
                              className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${s.isBlocked ? 'border-green-200 text-green-600 hover:bg-green-50' : 'border-amber-200 text-amber-600 hover:bg-amber-50'}`}>
                              {s.isBlocked ? 'Buka' : 'Blokir'}
                            </button>
                            <button onClick={() => handleDeleteSchedule(s.id)}
                              className="text-xs text-red-400 hover:text-red-600 px-2 py-1.5 transition-colors">
                              Hapus
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Portfolio ── */}
        {tab === 'portfolio' && (
          <div className="space-y-5">

            {/* Form upload */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h2 className="font-bold text-gray-900 mb-4">Upload Foto Portofolio</h2>
              <div className="space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                      Keterangan (opsional)
                    </label>
                    <input
                      type="text"
                      value={caption}
                      onChange={e => setCaption(e.target.value)}
                      placeholder="Contoh: Bridal look — Pernikahan Adat Jawa"
                      className="w-full bg-gray-50 border border-gray-200 focus:border-[#f6339a] rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                      Style (opsional)
                    </label>
                    <input
                      type="text"
                      value={style}
                      onChange={e => setStyle(e.target.value)}
                      placeholder="Contoh: Bridal, Glam, Natural"
                      className="w-full bg-gray-50 border border-gray-200 focus:border-[#f6339a] rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                    />
                  </div>
                </div>

                {uploadError && <p className="text-sm text-red-500">{uploadError}</p>}

                {/* Input file disembunyikan, tombol di bawah yang trigger */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full border-2 border-dashed border-[#f6339a]/30 hover:border-[#f6339a] bg-pink-50 hover:bg-[#fdf2f8] text-[#f6339a] font-bold py-4 rounded-xl transition-all disabled:opacity-60"
                >
                  {uploading ? 'Mengupload...' : '📷 Pilih & Upload Foto'}
                </button>
                <p className="text-xs text-gray-400 text-center">JPG, PNG, atau WEBP · Maks 5MB · Maks 50 foto</p>
              </div>
            </div>

            {/* Grid foto */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900">Foto Tersimpan</h2>
                <span className="text-xs text-gray-400">{portfolio.length}/50 foto</span>
              </div>

              {portoLoading ? (
                <div className="text-center py-12 text-gray-400 text-sm">Memuat portofolio...</div>
              ) : portfolio.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <div className="text-4xl mb-3">🖼</div>
                  <p className="font-semibold">Belum ada foto</p>
                  <p className="text-sm mt-1">Upload foto pertamamu di atas!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {portfolio.map(photo => (
                    <div key={photo.id} className="relative group aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-pink-50 to-rose-100">
                      <img
                        src={`http://localhost:3000${photo.photoUrl}`}
                        alt={photo.caption || 'Porto'}
                        className="w-full h-full object-cover"
                      />
                      {/* Overlay saat hover */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-3">
                        {photo.caption && (
                          <p className="text-white text-xs text-center font-medium">{photo.caption}</p>
                        )}
                        {photo.style && (
                          <p className="text-white text-xs text-center opacity-75">#{photo.style}</p>
                        )}
                        <button
                          onClick={() => handleDeletePhoto(photo.id)}
                          className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                        >
                          🗑 Hapus
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Profile ── */}
        {tab === 'profile' && (
          <div className="space-y-5">
            {profLoading ? (
              <div className="text-center py-16 text-gray-400 text-sm">Memuat profil...</div>
            ) : (
              <>
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h2 className="font-bold text-gray-900 mb-4">Profil Profesional</h2>
                  <div className="space-y-4">
                    {[
                      { label: 'Nama Brand / Studio', key: 'brandName',           placeholder: 'Bella Beauty Studio' },
                      { label: 'Lokasi Operasional',  key: 'operationalLocation', placeholder: 'Jakarta Selatan'     },
                      { label: 'Tahun Pengalaman',    key: 'yearsExperience',     placeholder: '5', type: 'number'   },
                    ].map(({ label, key, placeholder, type = 'text' }) => (
                      <div key={key}>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
                        <input type={type} value={profForm[key]} onChange={e => setProfForm(f => ({ ...f, [key]: e.target.value }))}
                          placeholder={placeholder}
                          className="w-full bg-gray-50 border border-gray-200 focus:border-[#f6339a] rounded-xl px-4 py-2.5 text-sm outline-none transition-all" />
                      </div>
                    ))}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Bio</label>
                      <textarea value={profForm.bio} onChange={e => setProfForm(f => ({ ...f, bio: e.target.value }))} rows={3}
                        placeholder="Ceritakan tentang dirimu dan keahlianmu..."
                        className="w-full bg-gray-50 border border-gray-200 focus:border-[#f6339a] rounded-xl px-4 py-3 text-sm outline-none resize-none transition-all" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h2 className="font-bold text-gray-900 mb-4">Spesialisasi & Style</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Spesialisasi</label>
                      <div className="flex flex-wrap gap-2">
                        {SPECIALIZATIONS.map(s => (
                          <button key={s} onClick={() => toggleArr('specializations', s, setProfForm)}
                            className={`text-sm px-3 py-1.5 rounded-full border font-medium transition-all ${profForm.specializations.includes(s) ? 'bg-[#f6339a] text-white border-[#f6339a]' : 'border-gray-200 text-gray-500 hover:border-[#f6339a] hover:text-[#f6339a]'}`}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Style Makeup</label>
                      <div className="flex flex-wrap gap-2">
                        {MAKEUP_STYLES.map(s => (
                          <button key={s} onClick={() => toggleArr('makeupStyles', s, setProfForm)}
                            className={`text-sm px-3 py-1.5 rounded-full border font-medium transition-all ${profForm.makeupStyles.includes(s) ? 'bg-[#f6339a] text-white border-[#f6339a]' : 'border-gray-200 text-gray-500 hover:border-[#f6339a] hover:text-[#f6339a]'}`}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h2 className="font-bold text-gray-900 mb-4">Setting Skinprep</h2>
                  <div className="grid sm:grid-cols-2 gap-3 mb-4">
                    {[
                      { key: 'canUseOwnSkinprep',   label: 'Bisa gunakan skinprep MUA'   },
                      { key: 'canUseClientSkinprep', label: 'Bisa gunakan skinprep klien' },
                    ].map(({ key, label }) => (
                      <div key={key} onClick={() => setProfForm(f => ({ ...f, [key]: !f[key] }))}
                        className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${profForm[key] ? 'border-[#f6339a] bg-pink-50' : 'border-gray-100 hover:border-gray-200'}`}>
                        <span className={`text-sm font-semibold ${profForm[key] ? 'text-[#f6339a]' : 'text-gray-500'}`}>{label}</span>
                        <div className={`w-10 h-6 rounded-full transition-colors relative ${profForm[key] ? 'bg-[#f6339a]' : 'bg-gray-200'}`}>
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${profForm[key] ? 'left-5' : 'left-1'}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                  {profForm.canUseOwnSkinprep && (
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Bahan Utama Skinprep Kamu</label>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {INGREDIENTS.map(b => (
                          <button key={b} onClick={() => toggleArr('ownSkinprepIngredients', b, setProfForm)}
                            className={`text-xs px-3 py-1.5 rounded-full border font-semibold transition-all ${profForm.ownSkinprepIngredients.includes(b) ? 'bg-[#f6339a] text-white border-[#f6339a]' : 'border-gray-200 text-gray-500 hover:border-[#f6339a] hover:text-[#f6339a]'}`}>
                            {b}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input type="text" value={profForm.customIngredient}
                          onChange={e => setProfForm(f => ({ ...f, customIngredient: e.target.value }))}
                          onKeyDown={e => {
                            if (e.key !== 'Enter') return
                            const val = profForm.customIngredient.trim()
                            if (!val || profForm.ownSkinprepIngredients.includes(val)) return
                            setProfForm(f => ({ ...f, ownSkinprepIngredients: [...f.ownSkinprepIngredients, val], customIngredient: '' }))
                          }}
                          placeholder="Tambah bahan lain..."
                          className="flex-1 bg-gray-50 border border-gray-200 focus:border-[#f6339a] rounded-xl px-4 py-2 text-sm outline-none transition-all" />
                        <button onClick={() => {
                          const val = profForm.customIngredient.trim()
                          if (!val || profForm.ownSkinprepIngredients.includes(val)) return
                          setProfForm(f => ({ ...f, ownSkinprepIngredients: [...f.ownSkinprepIngredients, val], customIngredient: '' }))
                        }} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold rounded-xl text-sm transition-colors">
                          + Tambah
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h2 className="font-bold text-gray-900 mb-4">Biaya Transport</h2>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {[
                      { value: 'free',   label: '🚗 Gratis'   },
                      { value: 'flat',   label: '📍 Flat Fee' },
                      { value: 'per_km', label: '📏 Per KM'   },
                    ].map(opt => (
                      <button key={opt.value} onClick={() => setProfForm(f => ({ ...f, transportType: opt.value }))}
                        className={`text-sm px-4 py-2 rounded-xl border font-semibold transition-all ${profForm.transportType === opt.value ? 'bg-[#f6339a] text-white border-[#f6339a]' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {profForm.transportType === 'flat' && (
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Flat Fee (Rp)</label>
                      <input type="number" value={profForm.transportFlatFee} onChange={e => setProfForm(f => ({ ...f, transportFlatFee: e.target.value }))}
                        placeholder="50000" className="w-full bg-gray-50 border border-gray-200 focus:border-[#f6339a] rounded-xl px-4 py-2.5 text-sm outline-none transition-all" />
                    </div>
                  )}
                  {profForm.transportType === 'per_km' && (
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Tarif per KM (Rp)</label>
                      <input type="number" value={profForm.transportPerKmRate} onChange={e => setProfForm(f => ({ ...f, transportPerKmRate: e.target.value }))}
                        placeholder="5000" className="w-full bg-gray-50 border border-gray-200 focus:border-[#f6339a] rounded-xl px-4 py-2.5 text-sm outline-none transition-all" />
                    </div>
                  )}
                </div>

                {profSuccess && (
                  <div className="bg-green-50 border border-green-200 text-green-700 text-sm font-medium px-4 py-3 rounded-xl">✓ {profSuccess}</div>
                )}
                {profError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-medium px-4 py-3 rounded-xl">{profError}</div>
                )}

                <button onClick={handleSaveProfile} disabled={profSaving}
                  className="w-full bg-[#f6339a] hover:bg-[#e01f87] disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-colors">
                  {profSaving ? 'Menyimpan...' : 'Simpan Profil'}
                </button>
              </>
            )}
          </div>
        )}

      </div>

      {/* ── Modal Paket ── */}
      {pkgModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setPkgModal(null)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="font-black text-gray-900 text-lg mb-4">
              {pkgModal === 'new' ? 'Tambah Paket Baru' : `Edit Paket — ${pkgModal.name}`}
            </h2>
            <div className="space-y-4">
              {[
                { label: 'Nama Paket',       key: 'name',            placeholder: 'Basic / Standard / Premium' },
                { label: 'Harga Dasar (Rp)', key: 'basePrice',       placeholder: '500000', type: 'number'     },
                { label: 'Durasi (menit)',   key: 'durationMinutes', placeholder: '90',     type: 'number'     },
              ].map(({ label, key, placeholder, type = 'text' }) => (
                <div key={key}>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
                  <input type={type} value={pkgForm[key]} onChange={e => setPkgForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder} className="w-full bg-gray-50 border border-gray-200 focus:border-[#f6339a] rounded-xl px-4 py-2.5 text-sm outline-none transition-all" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Deskripsi</label>
                <input type="text" value={pkgForm.description} onChange={e => setPkgForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Deskripsi singkat paket" className="w-full bg-gray-50 border border-gray-200 focus:border-[#f6339a] rounded-xl px-4 py-2.5 text-sm outline-none transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Layanan yang Termasuk</label>
                <p className="text-xs text-gray-400 mb-1.5">Satu layanan per baris</p>
                <textarea value={pkgForm.includedServices} onChange={e => setPkgForm(f => ({ ...f, includedServices: e.target.value }))}
                  rows={4} placeholder={"Natural/MLBB makeup\nSetting spray\nTouch-up mini"}
                  className="w-full bg-gray-50 border border-gray-200 focus:border-[#f6339a] rounded-xl px-4 py-3 text-sm outline-none resize-none transition-all" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setPkgModal(null)} className="flex-1 py-3 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50">Batal</button>
              <button onClick={handleSavePkg} disabled={pkgSaving}
                className="flex-1 py-3 bg-[#f6339a] hover:bg-[#e01f87] disabled:opacity-60 text-white font-bold rounded-xl transition-colors">
                {pkgSaving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Add-on ── */}
      {addonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setAddonModal(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
            <h2 className="font-black text-gray-900 text-lg mb-4">Tambah Add-on</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Nama Add-on</label>
                <input type="text" value={addonForm.name} onChange={e => setAddonForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Skinprep Treatment" className="w-full bg-gray-50 border border-gray-200 focus:border-[#f6339a] rounded-xl px-4 py-2.5 text-sm outline-none transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Harga (Rp)</label>
                <input type="number" value={addonForm.price} onChange={e => setAddonForm(f => ({ ...f, price: e.target.value }))}
                  placeholder="75000" className="w-full bg-gray-50 border border-gray-200 focus:border-[#f6339a] rounded-xl px-4 py-2.5 text-sm outline-none transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Deskripsi (opsional)</label>
                <input type="text" value={addonForm.description} onChange={e => setAddonForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Perawatan kulit sebelum makeup" className="w-full bg-gray-50 border border-gray-200 focus:border-[#f6339a] rounded-xl px-4 py-2.5 text-sm outline-none transition-all" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setAddonModal(false)} className="flex-1 py-3 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50">Batal</button>
              <button onClick={handleSaveAddon} disabled={pkgSaving}
                className="flex-1 py-3 bg-[#f6339a] hover:bg-[#e01f87] disabled:opacity-60 text-white font-bold rounded-xl transition-colors">
                {pkgSaving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Tolak Booking ── */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setRejectModal(null)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
            <h2 className="font-black text-gray-900 text-lg mb-1">Tolak Booking</h2>
            <p className="text-sm text-gray-400 mb-4">Berikan alasan penolakan (akan dikirim ke klien)</p>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
              placeholder="Contoh: Jadwal sudah penuh di tanggal tersebut…" rows={3}
              className="w-full bg-gray-50 border border-gray-200 focus:border-red-400 rounded-xl px-4 py-3 text-sm outline-none resize-none transition-all mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setRejectModal(null)} className="flex-1 py-3 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50">Batal</button>
              <button onClick={handleConfirmReject} disabled={respondLoading}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white font-bold rounded-xl transition-colors">
                {respondLoading ? 'Memproses...' : 'Konfirmasi Tolak'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default MuaDashboard