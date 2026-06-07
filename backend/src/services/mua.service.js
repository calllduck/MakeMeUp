const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const getMuaDetail = async (muaProfileId, requestingUserId) => {
  const mua = await prisma.muaProfile.findFirst({
    where: {
      id: parseInt(muaProfileId),
      deletedAt: null
    },
    include: {
      user: { select: { name: true, email: true } },
      servicePackages: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' }
      },
      packageAddons: {
        where: { isActive: true }
      },
      schedules: {
        where: {
          isBlocked: false,
          bookingId: null,
          date: { gte: (() => { const d = new Date(); d.setUTCHours(0, 0, 0, 0); return d })() }
        },
        orderBy: [{ date: 'asc' }, { startTime: 'asc' }]
      }
    }
  })

  if (!mua) throw new Error('MUA tidak ditemukan')

  // Hitung skin compatibility kalau klien login
  let skinCompatibility = null
  let conflictIngredients = []

  if (requestingUserId) {
    const clientProfile = await prisma.clientProfile.findUnique({
      where: { userId: String(requestingUserId) }
    })

    if (clientProfile && clientProfile.sensitiveIngredients) {
      const sensitiveList = clientProfile.sensitiveIngredients

      if (!mua.canUseOwnSkinprep || !mua.ownSkinprepIngredients) {
        skinCompatibility = 'compatible'
      } else {
        const muaIngredients = mua.ownSkinprepIngredients
        const conflicts = muaIngredients.filter(ingredient =>
          sensitiveList.some(sensitive =>
            ingredient.toLowerCase().includes(sensitive.toLowerCase())
          )
        )
        skinCompatibility = conflicts.length > 0 ? 'conflict' : 'compatible'
        conflictIngredients = conflicts
      }
    } else {
      // Klien login tapi belum isi profil kulit
      skinCompatibility = 'incomplete_profile'
    }
  }

  return {
    ...mua,
    skinCompatibility,
    conflictIngredients
  }
}

module.exports = { getMuaDetail }