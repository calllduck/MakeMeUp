const express = require('express')
const router = express.Router()
const paymentController = require('../controllers/payment.controller')
const { authenticate } = require('../middleware/auth.middleware')

// Buat transaksi — butuh login
router.post('/bookings/:bookingId/pay', authenticate, paymentController.createPayment)

// Webhook Midtrans — tidak butuh login, Midtrans yang panggil
router.post('/notification', paymentController.handleNotification)

module.exports = router