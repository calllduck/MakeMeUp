const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Ambil muaProfileId berdasarkan userId
const getMuaProfileId = async (userId) => {
  const mua = await prisma.muaProfile.findUnique({
    where: { userId }
  })
  if (!mua) throw new Error('Profil MUA tidak ditemukan')
  return mua.id
}

// Buat paket baru
const createPackage = async (userId, data) => {
  const muaProfileId = await getMuaProfileId(userId)

  // Cek maksimal 5 paket
  const count = await prisma.servicePackage.count({
    where: { muaProfileId, isActive: true }
  })
  if (count >= 5) throw new Error('Maksimal 5 paket layanan')

  return prisma.servicePackage.create({
    data: {
      muaProfileId,
      name: data.name,
      description: data.description || null,
      basePrice: data.basePrice,
      durationMinutes: data.durationMinutes,
      includedServices: data.includedServices,
      sortOrder: data.sortOrder || 0
    }
  })
}

// Ambil semua paket milik MUA
const getMyPackages = async (userId) => {
  const muaProfileId = await getMuaProfileId(userId)
  return prisma.servicePackage.findMany({
    where: { muaProfileId, isActive: true },
    include: { addons: { where: { isActive: true } } },
    orderBy: { sortOrder: 'asc' }
  })
}

// Edit paket
const updatePackage = async (userId, packageId, data) => {
  const muaProfileId = await getMuaProfileId(userId)

  // Pastikan paket ini milik MUA yang login
  const pkg = await prisma.servicePackage.findFirst({
    where: { id: parseInt(packageId), muaProfileId }
  })
  if (!pkg) throw new Error('Paket tidak ditemukan')

  return prisma.servicePackage.update({
    where: { id: parseInt(packageId) },
    data: {
      name: data.name ?? pkg.name,
      description: data.description ?? pkg.description,
      basePrice: data.basePrice ?? pkg.basePrice,
      durationMinutes: data.durationMinutes ?? pkg.durationMinutes,
      includedServices: data.includedServices ?? pkg.includedServices,
      sortOrder: data.sortOrder ?? pkg.sortOrder
    }
  })
}

// Hapus paket (soft delete — isActive jadi false)
const deletePackage = async (userId, packageId) => {
  const muaProfileId = await getMuaProfileId(userId)
  const pkg = await prisma.servicePackage.findFirst({
    where: { id: parseInt(packageId), muaProfileId }
  })
  if (!pkg) throw new Error('Paket tidak ditemukan')

  return prisma.servicePackage.update({
    where: { id: parseInt(packageId) },
    data: { isActive: false }
  })
}

// Buat add-on baru
const createAddon = async (userId, data) => {
  const muaProfileId = await getMuaProfileId(userId)
  return prisma.packageAddon.create({
    data: {
      muaProfileId,
      name: data.name,
      description: data.description || null,
      price: data.price
    }
  })
}

// Ambil semua add-on milik MUA
const getMyAddons = async (userId) => {
  const muaProfileId = await getMuaProfileId(userId)
  return prisma.packageAddon.findMany({
    where: { muaProfileId, isActive: true }
  })
}

// Hapus add-on
const deleteAddon = async (userId, addonId) => {
  const muaProfileId = await getMuaProfileId(userId)
  const addon = await prisma.packageAddon.findFirst({
    where: { id: parseInt(addonId), muaProfileId }
  })
  if (!addon) throw new Error('Add-on tidak ditemukan')

  return prisma.packageAddon.update({
    where: { id: parseInt(addonId) },
    data: { isActive: false }
  })
}

module.exports = {
  createPackage, getMyPackages, updatePackage,
  deletePackage, createAddon, getMyAddons, deleteAddon
}