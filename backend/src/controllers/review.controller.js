const reviewService = require('../services/review.service')
const { sendSuccess, sendError } = require('../utils/response')

const createReview = async (req, res) => {
  try {
    const { bookingId, rating, content } = req.body
    const review = await reviewService.createReview(req.user.id, bookingId, { rating, content })
    sendSuccess(res, review, 'Review berhasil dikirim', 201)
  } catch (err) {
    sendError(res, err.message)
  }
}

const getMuaReviews = async (req, res) => {
  try {
    const reviews = await reviewService.getMuaReviews(parseInt(req.params.muaId))
    sendSuccess(res, reviews)
  } catch (err) {
    sendError(res, err.message)
  }
}

const replyReview = async (req, res) => {
  try {
    const { muaReply } = req.body
    const review = await reviewService.replyReview(req.params.id, req.user.id, muaReply)
    sendSuccess(res, review, 'Balasan berhasil disimpan')
  } catch (err) {
    sendError(res, err.message)
  }
}

module.exports = { createReview, getMuaReviews, replyReview }