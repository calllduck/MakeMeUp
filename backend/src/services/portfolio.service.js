const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const path = require('path')
const fs = require('fs')

const getPortfolio = async (muaProfileId) => {
  return prisma.portfolio.findMany({
    where: { muaProfileId: Number(muaProfileId) },
    orderBy: { createdAt: 'desc' },
  })
}

const uploadPhoto = async (userId, file, caption, style) => {
  // Cari profil MUA berdasarkan userId
  const profile = await prisma.muaProfile.findUnique({ where: { userId } })
  if (!profile) throw new Error('Profil MUA tidak ditemukan')

  // Simpan file ke folder uploads
  const uploadDir = path.join(__dirname, '../../uploads')
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

  const filename = `${Date.now()}-${file.originalname}`
  const filepath = path.join(uploadDir, filename)
  fs.writeFileSync(filepath, file.buffer)

  return prisma.portfolio.create({
    data: {
      muaProfileId: profile.id,
      photoUrl: `/uploads/${filename}`,
      caption: caption || null,
      style: style || null,
    },
  })
}

const deletePhoto = async (userId, photoId) => {
  const profile = await prisma.muaProfile.findUnique({ where: { userId } })
  if (!profile) throw new Error('Profil MUA tidak ditemukan')

  const photo = await prisma.portfolio.findFirst({
    where: { id: Number(photoId), muaProfileId: profile.id },
  })
  if (!photo) throw new Error('Foto tidak ditemukan')

  // Hapus file dari disk
  const filepath = path.join(__dirname, '../..', photo.photoUrl)
  if (fs.existsSync(filepath)) fs.unlinkSync(filepath)

  return prisma.portfolio.delete({ where: { id: Number(photoId) } })
}

module.exports = { getPortfolio, uploadPhoto, deletePhoto }