const express = require('express')
const router = express.Router()
const searchController = require('../controllers/search.controller')
const { authenticate } = require('../middleware/auth.middleware')

// optionalAuth — coba decode token kalau ada, tapi tidak wajib
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization']
  if (!authHeader) return next() // tidak ada token, lanjut saja

  const token = authHeader.split(' ')[1]
  try {
    const jwt = require('jsonwebtoken')
    req.user = jwt.verify(token, process.env.JWT_SECRET)
  } catch {
    // token invalid atau expired, abaikan saja
  }
  next()
}

router.get('/', optionalAuth, searchController.searchMUA)

module.exports = router