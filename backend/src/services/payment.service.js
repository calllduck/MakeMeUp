const midtransClient = require('midtrans-client')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Inisialisasi Midtrans Snap
// Snap = tampilan pembayaran pop-up dari Midtrans
const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY
})

// Buat transaksi Midtrans dan simpan payment ke database
async function createPayment(bookingId, userId) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      muaProfile: { select: { brandName: true } },
      package: { select: { name: true } }
    }
  })

  if (!booking) throw new Error('Booking tidak ditemukan')
  if (booking.clientId !== userId) throw new Error('Akses ditolak')
  if (booking.status !== 'confirmed') throw new Error('Booking belum dikonfirmasi MUA')

  // Cek apakah payment sudah pernah dibuat sebelumnya
  const existingPayment = await prisma.payment.findUnique({ where: { bookingId } })
  if (existingPayment && existingPayment.status === 'paid') throw new Error('Booking ini sudah dibayar')

  // Parameter transaksi yang dikirim ke Midtrans
  const parameter = {
    transaction_details: {
      order_id: `${booking.bookingCode}-${Date.now()}`, // ID unik transaksi — pakai booking code
      gross_amount: Math.round(Number(booking.totalPrice)) // harus integer, dalam Rupiah
    },
    item_details: [
      {
        id: `PKG-${booking.packageId}`,
        price: Math.round(Number(booking.basePrice)),
        quantity: 1,
        name: `${booking.package.name} - ${booking.muaProfile.brandName}`
      },
      ...(Number(booking.addonsPrice) > 0 ? [{
        id: 'ADDONS',
        price: Math.round(Number(booking.addonsPrice)),
        quantity: 1,
        name: 'Add-on Layanan'
      }] : []),
      ...(Number(booking.transportFee) > 0 ? [{
        id: 'TRANSPORT',
        price: Math.round(Number(booking.transportFee)),
        quantity: 1,
        name: 'Biaya Transport'
      }] : [])
    ],
    customer_details: {
      user_id: userId
    }
  }

  // Minta Midtrans buat transaksi, dapatkan token & redirect URL
const orderId = `${booking.bookingCode}-${Date.now()}`
parameter.transaction_details.order_id = orderId

const transaction = await snap.createTransaction(parameter)

await prisma.payment.upsert({
  where: { bookingId },
  update: { midtransOrderId: orderId, amount: booking.totalPrice },
  create: {
    bookingId,
    midtransOrderId: orderId,
    amount: booking.totalPrice,
    status: 'pending'
  }
})

  return {
    token: transaction.token,           // dipakai Snap.js di frontend untuk buka popup
    redirectUrl: transaction.redirect_url // alternatif: redirect ke halaman Midtrans
  }
}

// Proses notifikasi dari Midtrans (webhook)
// Midtrans akan POST ke endpoint ini setiap kali status pembayaran berubah
async function handleNotification(notificationData) {
  const statusResponse = await snap.transaction.notification(notificationData)

  const orderId = statusResponse.order_id
  const transactionStatus = statusResponse.transaction_status
  const fraudStatus = statusResponse.fraud_status

  let paymentStatus = 'pending'
  let bookingStatus = null

  if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
    if (fraudStatus === 'accept' || !fraudStatus) {
      paymentStatus = 'paid'
      bookingStatus = 'paid'
    }
  } else if (transactionStatus === 'cancel' || transactionStatus === 'deny' || transactionStatus === 'expire') {
    paymentStatus = 'pending'
  }

  // Update payment — cari berdasarkan midtransOrderId yang kita simpan
  const payment = await prisma.payment.findUnique({
    where: { midtransOrderId: orderId }
  })

  if (!payment) throw new Error(`Payment dengan order_id ${orderId} tidak ditemukan`)

  await prisma.payment.update({
    where: { midtransOrderId: orderId },
    data: {
      status: paymentStatus,
      method: statusResponse.payment_type,
      paidAt: paymentStatus === 'paid' ? new Date() : null
    }
  })

  if (bookingStatus) {
    await prisma.booking.update({
      where: { id: payment.bookingId },
      data: { status: bookingStatus }
    })
  }

  return statusResponse
}

module.exports = { createPayment, handleNotification }