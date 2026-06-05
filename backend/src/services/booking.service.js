const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Generate kode booking unik, contoh: MMU-20250701-A3X9
function generateBookingCode() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `MMU-${date}-${rand}`
}

// Buat booking baru
async function createBooking(clientId, data) {
  const { muaProfileId, packageId, addonIds, sessionDate, sessionStart, sessionLocation, clientNotes } = data

  // Ambil data paket dari database untuk dapat harganya
  const pkg = await prisma.servicePackage.findUnique({ where: { id: packageId } })
  if (!pkg) throw new Error('Paket layanan tidak ditemukan')

  // Ambil data MUA untuk cek transport fee
  const mua = await prisma.muaProfile.findUnique({ where: { id: muaProfileId } })
  if (!mua) throw new Error('MUA tidak ditemukan')

  // Hitung harga add-on yang dipilih
  let addonsPrice = 0
  let selectedAddons = []
  if (addonIds && addonIds.length > 0) {
    const addons = await prisma.packageAddon.findMany({
      where: { id: { in: addonIds }, muaProfileId }
    })
    addonsPrice = addons.reduce((sum, a) => sum + Number(a.price), 0)
    selectedAddons = addons.map(a => ({ id: a.id, name: a.name, price: Number(a.price) }))
  }

  // Transport fee: untuk sekarang kita pakai flat fee jika ada, atau 0
  // (Google Maps API kita skip sesuai dev phases)
  const transportFee = mua.transportType === 'flat' ? Number(mua.transportFlatFee || 0) : 0

  const totalPrice = Number(pkg.basePrice) + addonsPrice + transportFee

  const booking = await prisma.booking.create({
    data: {
      bookingCode: generateBookingCode(),
      clientId,
      muaProfileId,
      packageId,
      selectedAddons,
      sessionDate: new Date(sessionDate),
      sessionStart,
      sessionLocation,
      clientNotes,
      basePrice: Number(pkg.basePrice),
      addonsPrice,
      transportFee,
      totalPrice,
      status: 'pending'
    },
    include: {
      muaProfile: { select: { brandName: true } },
      package: { select: { name: true } }
    }
  })

  return booking
}

// Ambil daftar booking (untuk klien atau MUA)
async function getBookings(userId, role) {
  let where = {}

  if (role === 'client') {
    where = { clientId: userId }
  } else if (role === 'mua') {
    const mua = await prisma.muaProfile.findUnique({ where: { userId } })
    if (!mua) throw new Error('Profil MUA tidak ditemukan')
    where = { muaProfileId: mua.id }
  }

  const bookings = await prisma.booking.findMany({
    where,
    include: {
      muaProfile: { select: { brandName: true, avatarUrl: true } },
      package: { select: { name: true } },
      payment: { select: { status: true, method: true } }
    },
    orderBy: { createdAt: 'desc' }
  })

  return bookings
}

// Ambil detail satu booking
async function getBookingById(bookingId, userId, role) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      muaProfile: { select: { brandName: true, avatarUrl: true, operationalLocation: true } },
      package: { select: { name: true, description: true } },
      payment: true
    }
  })

  if (!booking) throw new Error('Booking tidak ditemukan')

  // Pastikan yang akses adalah pemilik booking atau MUA yang bersangkutan
  if (role === 'client' && booking.clientId !== userId) throw new Error('Akses ditolak')
  if (role === 'mua') {
    const mua = await prisma.muaProfile.findUnique({ where: { userId } })
    if (!mua || booking.muaProfileId !== mua.id) throw new Error('Akses ditolak')
  }

  return booking
}

// MUA terima atau tolak booking
async function respondToBooking(bookingId, userId, action, rejectionReason) {
  const mua = await prisma.muaProfile.findUnique({ where: { userId } })
  if (!mua) throw new Error('Profil MUA tidak ditemukan')

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } })
  if (!booking) throw new Error('Booking tidak ditemukan')
  if (booking.muaProfileId !== mua.id) throw new Error('Akses ditolak')
  if (booking.status !== 'pending') throw new Error('Booking ini sudah direspons sebelumnya')

  if (action === 'accept') {
    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'confirmed' }
    })
    return updated
  } else if (action === 'reject') {
    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'rejected', rejectionReason }
    })
    return updated
  } else {
    throw new Error('Action tidak valid, gunakan "accept" atau "reject"')
  }
}

module.exports = { createBooking, getBookings, getBookingById, respondToBooking }