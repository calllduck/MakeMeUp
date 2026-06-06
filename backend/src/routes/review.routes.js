const express = require('express')
const router = express.Router()
const { authenticate, authorize } = require('../middleware/auth.middleware')
const { createReview, getMuaReviews, replyReview } = require('../controllers/review.controller')

// Klien buat review
router.post('/', authenticate, authorize('client'), createReview)

// Lihat review MUA (public)
router.get('/mua/:muaId', getMuaReviews)

// MUA balas review
router.patch('/:id/reply', authenticate, authorize('mua'), replyReview)

module.exports = router