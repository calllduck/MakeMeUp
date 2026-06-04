const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getClientProfile = async (userId) => {
  const profile = await prisma.clientProfile.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  return profile;
};

const upsertClientProfile = async (userId, data) => {
  // "upsert" = update kalau sudah ada, insert kalau belum ada
  const profile = await prisma.clientProfile.upsert({
    where: { userId },
    update: data,
    create: {
      userId,
      ...data,
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  return profile;
};

const getMuaProfile = async (userId) => {
  const profile = await prisma.muaProfile.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  return profile;
};

const upsertMuaProfile = async (userId, data) => {
  const profile = await prisma.muaProfile.upsert({
    where: { userId },
    update: data,
    create: {
      userId,
      ...data,
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  return profile;
};

module.exports = { getClientProfile, upsertClientProfile, getMuaProfile, upsertMuaProfile };