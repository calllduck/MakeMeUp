const express = require('express')
const router = express.Router()
const muaController = require('../controllers/mua.controller')

// optionalAuth — sama seperti search, bisa diakses tanpa login
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization']
  if (!authHeader) return next()

  const token = authHeader.split(' ')[1]
  try {
    const jwt = require('jsonwebtoken')
    req.user = jwt.verify(token, process.env.JWT_SECRET)
  } catch {
    // token invalid, abaikan
  }
  next()
}

router.get('/:id', optionalAuth, muaController.getMuaDetail)

module.exports = router