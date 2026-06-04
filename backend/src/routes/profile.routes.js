const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Kedua route ini butuh login dan hanya untuk client
router.get('/client', authenticate, authorize('client'), profileController.getClientProfile);
router.put('/client', authenticate, authorize('client'), profileController.updateClientProfile);

// Kedua route ini butuh login dan hanya untuk MUA
router.get('/mua', authenticate, authorize('mua'), profileController.getMuaProfile);
router.put('/mua', authenticate, authorize('mua'), profileController.updateMuaProfile);

module.exports = router;