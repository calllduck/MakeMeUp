const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Kirim pesan
const sendMessage = async (senderId, receiverId, muaProfileId, content) => {
  if (!content?.trim()) throw new Error('Pesan tidak boleh kosong')

  return await prisma.message.create({
    data: {
      sender: { connect: { id: senderId } },
      receiver: { connect: { id: receiverId } },
      muaProfile: { connect: { id: muaProfileId } },
      content: content.trim()
    },
    include: {
      sender: { select: { id: true, name: true, role: true } }
    }
  })
}

// Ambil semua pesan dalam satu percakapan (antara klien dan MUA)
const getConversation = async (userAId, userBId, muaProfileId) => {
  return await prisma.message.findMany({
    where: {
      muaProfileId,
      OR: [
        { senderId: userAId, receiverId: userBId },
        { senderId: userBId, receiverId: userAId }
      ]
    },
    include: {
      sender: { select: { id: true, name: true, role: true } }
    },
    orderBy: { createdAt: 'asc' }
  })
}

// Ambil daftar inbox — semua conversation unik yang melibatkan user ini
const getInbox = async (userId) => {
  const messages = await prisma.message.findMany({
    where: {
      OR: [{ senderId: userId }, { receiverId: userId }]
    },
    include: {
      sender: { select: { id: true, name: true } },
      receiver: { select: { id: true, name: true } },
      muaProfile: { select: { id: true, brandName: true } }
    },
    orderBy: { createdAt: 'desc' }
  })

  // Deduplikasi — ambil pesan terakhir per conversation unik
  const seen = new Set()
  const inbox = []
  for (const msg of messages) {
    const key = [msg.muaProfileId, msg.senderId, msg.receiverId].sort().join('-')
    if (!seen.has(key)) {
      seen.add(key)
      inbox.push(msg)
    }
  }

  return inbox
}

module.exports = { sendMessage, getConversation, getInbox }