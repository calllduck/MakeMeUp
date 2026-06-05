const express = require('express')
const router = express.Router()
const packageController = require('../controllers/package.controller')
const { authenticate, authorize } = require('../middleware/auth.middleware')

// Semua route di sini hanya bisa diakses MUA yang sudah login
router.use(authenticate)
router.use(authorize('mua'))

// Paket
router.post('/', packageController.createPackage)
router.get('/', packageController.getMyPackages)
router.put('/:id', packageController.updatePackage)
router.delete('/:id', packageController.deletePackage)

// Add-on
router.post('/addons', packageController.createAddon)
router.get('/addons', packageController.getMyAddons)
router.delete('/addons/:id', packageController.deleteAddon)

module.exports = router