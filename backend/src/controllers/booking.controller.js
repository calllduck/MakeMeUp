const bookingService = require('../services/booking.service')

async function createBooking(req, res) {
  try {
    const booking = await bookingService.createBooking(req.user.userId, req.body)
    res.status(201).json({ success: true, data: booking })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
}

async function getBookings(req, res) {
  try {
    const bookings = await bookingService.getBookings(req.user.userId, req.user.role)
    res.json({ success: true, data: bookings })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
}

async function getBookingById(req, res) {
  try {
    const booking = await bookingService.getBookingById(
      parseInt(req.params.id),
      req.user.userId,
      req.user.role
    )
    res.json({ success: true, data: booking })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
}

async function respondToBooking(req, res) {
  try {
    const { action, rejectionReason } = req.body
    const booking = await bookingService.respondToBooking(
      parseInt(req.params.id),
      req.user.userId,
      action,
      rejectionReason
    )
    res.json({ success: true, data: booking })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
}

async function completeBooking(req, res) {
  try {
    const booking = await bookingService.completeBooking(
      parseInt(req.params.id),
      req.user.userId
    )
    res.json({ success: true, data: booking })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
}

module.exports = { createBooking, getBookings, getBookingById, respondToBooking, completeBooking }