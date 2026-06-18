const express = require('express')
const router = express.Router()
const bookingController = require('../controllers/booking.controller')
const { authenticate, authorize } = require('../middleware/auth.middleware')

// Semua route booking butuh login
router.use(authenticate)

// Buat booking baru — hanya client
router.post('/', authorize('client'), bookingController.createBooking)

// Lihat semua booking milik sendiri — client dan MUA
router.get('/', bookingController.getBookings)

// Lihat detail satu booking
router.get('/:id', bookingController.getBookingById)

// MUA terima/tolak booking — hanya MUA
router.patch('/:id/respond', authorize('mua'), bookingController.respondToBooking)
router.patch('/:id/complete', authorize('client'), bookingController.completeBooking)

module.exports = router