const paymentService = require('../services/payment.service')

async function createPayment(req, res) {
  try {
    const result = await paymentService.createPayment(
      parseInt(req.params.bookingId),
      req.user.userId
    )
    res.json({ success: true, data: result })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
}

async function handleNotification(req, res) {
  try {
    await paymentService.handleNotification(req.body)
    res.status(200).json({ status: 'ok' })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
}

module.exports = { createPayment, handleNotification }