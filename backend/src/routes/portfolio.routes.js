const express = require('express')
const router = express.Router()
const multer = require('multer')
const portfolioController = require('../controllers/portfolio.controller')
const { authenticate } = require('../middleware/auth.middleware')

// Multer — library untuk handle upload file
// memoryStorage = file disimpan di RAM dulu, bukan langsung ke disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // maks 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    if (allowed.includes(file.mimetype)) cb(null, true)
    else cb(new Error('Format file tidak didukung'))
  },
})

router.get('/:muaProfileId', portfolioController.getPortfolio)
router.post('/', authenticate, upload.single('photo'), portfolioController.uploadPhoto)
router.delete('/:photoId', authenticate, portfolioController.deletePhoto)

module.exports = router