const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Klien buat review
const createReview = async (clientId, bookingId, { rating, content }) => {
  // Cek booking milik klien ini dan statusnya completed
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, clientId, status: 'completed' }
  })
  if (!booking) throw new Error('Booking tidak ditemukan atau belum selesai')

  // Cek belum pernah review booking ini
  const existing = await prisma.review.findUnique({ where: { bookingId } })
  if (existing) throw new Error('Kamu sudah memberikan review untuk booking ini')

  // Validasi rating
  if (rating < 1 || rating > 5) throw new Error('Rating harus antara 1 sampai 5')

  const review = await prisma.review.create({
    data: {
      bookingId,
      clientId,
      muaProfileId: booking.muaProfileId,
      rating,
      content
    }
  })

  // Update rata-rata rating di profil MUA
  const allReviews = await prisma.review.findMany({
    where: { muaProfileId: booking.muaProfileId }
  })
  const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length

  await prisma.muaProfile.update({
    where: { id: booking.muaProfileId },
    data: {
      ratingAvg: Math.round(avg * 100) / 100,
      reviewCount: allReviews.length
    }
  })

  return review
}

// Lihat semua review milik satu MUA
const getMuaReviews = async (muaProfileId) => {
  return await prisma.review.findMany({
    where: { muaProfileId },
    include: {
      client: { select: { name: true } }
    },
    orderBy: { createdAt: 'desc' }
  })
}

// MUA balas review
const replyReview = async (reviewId, muaUserId, muaReply) => {
  // Cek review ada dan milik MUA ini
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: { muaProfile: true }
  })
  if (!review) throw new Error('Review tidak ditemukan')
  if (review.muaProfile.userId !== muaUserId) throw new Error('Tidak punya akses')
  if (review.muaReply) throw new Error('Kamu sudah membalas review ini')

  return await prisma.review.update({
    where: { id: reviewId },
    data: { muaReply }
  })
}

module.exports = { createReview, getMuaReviews, replyReview }