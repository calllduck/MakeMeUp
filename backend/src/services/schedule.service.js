const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const getMuaProfileId = async (userId) => {
  const mua = await prisma.muaProfile.findUnique({
    where: { userId: String(userId) }
  })
  if (!mua) throw new Error('Profil MUA tidak ditemukan')
  return mua.id
}

// Tambah slot jadwal baru
const createSchedule = async (userId, data) => {
  const muaProfileId = await getMuaProfileId(userId)

  // Cek apakah slot di tanggal + waktu yang sama sudah ada
  const existing = await prisma.muaSchedule.findFirst({
    where: {
      muaProfileId,
      date: new Date(data.date),
      startTime: data.startTime
    }
  })
  if (existing) throw new Error('Slot waktu ini sudah ada')

  return prisma.muaSchedule.create({
    data: {
      muaProfileId,
      date: new Date(data.date),
      startTime: data.startTime,
      endTime: data.endTime,
      isBlocked: false
    }
  })
}

// Ambil semua jadwal milik MUA
const getMySchedules = async (userId) => {
  const muaProfileId = await getMuaProfileId(userId)
  return prisma.muaSchedule.findMany({
    where: { muaProfileId },
    orderBy: [{ date: 'asc' }, { startTime: 'asc' }]
  })
}

// Hapus slot jadwal
const deleteSchedule = async (userId, scheduleId) => {
  const muaProfileId = await getMuaProfileId(userId)
  const schedule = await prisma.muaSchedule.findFirst({
    where: { id: parseInt(scheduleId), muaProfileId }
  })
  if (!schedule) throw new Error('Jadwal tidak ditemukan')

  return prisma.muaSchedule.delete({
    where: { id: parseInt(scheduleId) }
  })
}

// Blokir atau unblokir slot
const toggleBlockSchedule = async (userId, scheduleId) => {
  const muaProfileId = await getMuaProfileId(userId)
  const schedule = await prisma.muaSchedule.findFirst({
    where: { id: parseInt(scheduleId), muaProfileId }
  })
  if (!schedule) throw new Error('Jadwal tidak ditemukan')

  return prisma.muaSchedule.update({
    where: { id: parseInt(scheduleId) },
    data: { isBlocked: !schedule.isBlocked }
  })
}

module.exports = { createSchedule, getMySchedules, deleteSchedule, toggleBlockSchedule }