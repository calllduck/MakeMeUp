const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const searchMUA = async (filters, requestingUserId) => {
  const {
    location,
    style,
    minPrice,
    maxPrice,
    minRating,
    date,
    skinprep
  } = filters

  // Bangun kondisi filter secara dinamis
  const where = {
    deletedAt: null,
    isVerified: false // untuk dev, tampilkan semua MUA termasuk yang belum verified
  }

  // Filter lokasi — cari yang mengandung kata kunci (tidak harus exact match)
  if (location) {
    where.operationalLocation = {
      contains: location,
      mode: 'insensitive' // tidak case-sensitive
    }
  }

  // Filter style — cek apakah array makeupStyles mengandung style yang dicari
    if (style) {
    where.makeupStyles = {
        array_contains: style
    }
    }

    // Filter specialization — cari di specializations (Bridal, Wisuda, dll)
    if (filters.specialization) {
    where.specializations = {
        array_contains: filters.specialization
    }
    }

  // Filter rating minimum
  if (minRating) {
    where.ratingAvg = { gte: parseFloat(minRating) }
  }

  // Filter skinprep
  if (skinprep === 'own') where.canUseOwnSkinprep = true
  if (skinprep === 'client') where.canUseClientSkinprep = true

  // Ambil data MUA beserta paket dan jadwalnya
  const muas = await prisma.muaProfile.findMany({
    where,
    include: {
      user: { select: { name: true, email: true } },
      servicePackages: {
        where: { isActive: true },
        orderBy: { basePrice: 'asc' }
      },
      schedules: date ? {
        where: {
          date: new Date(date),
          isBlocked: false
        }
      } : false
    }
  })

  // Filter harga — dilakukan setelah query karena harga ada di paket
  let result = muas

  if (minPrice || maxPrice) {
    result = result.filter(mua => {
      if (mua.servicePackages.length === 0) return false
      const cheapest = Math.min(...mua.servicePackages.map(p => parseFloat(p.basePrice)))
      if (minPrice && cheapest < parseFloat(minPrice)) return false
      if (maxPrice && cheapest > parseFloat(maxPrice)) return false
      return true
    })
  }

  // Filter tanggal — hanya tampilkan MUA yang punya slot tersedia di tanggal itu
  if (date) {
    result = result.filter(mua => mua.schedules && mua.schedules.length > 0)
  }

  // Hitung skin compatibility jika ada userId klien yang login
  if (requestingUserId) {
    const clientProfile = await prisma.clientProfile.findUnique({
      where: { userId: String(requestingUserId) }
    })

    if (clientProfile && clientProfile.sensitiveIngredients) {
      const sensitiveList = clientProfile.sensitiveIngredients

      result = result.map(mua => {
        // Kalau MUA tidak pakai skinprep sendiri, tidak ada konflik
        if (!mua.canUseOwnSkinprep || !mua.ownSkinprepIngredients) {
          return { ...mua, skinCompatibility: 'compatible' }
        }

        const muaIngredients = mua.ownSkinprepIngredients
        const conflicts = muaIngredients.filter(ingredient =>
          sensitiveList.some(sensitive =>
            ingredient.toLowerCase().includes(sensitive.toLowerCase())
          )
        )

        return {
          ...mua,
          skinCompatibility: conflicts.length > 0 ? 'conflict' : 'compatible',
          conflictIngredients: conflicts
        }
      })
    }
  }

  return result
}

module.exports = { searchMUA }