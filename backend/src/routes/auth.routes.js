const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// POST /api/auth/register
router.post('/register', authController.register);
// POST /api/auth/login
router.post('/login', authController.login);

// route test — hapus nanti setelah konfirmasi jalan
// router.get('/test-auth', authenticate, (req, res) => {
//   res.json({ message: 'Kamu berhasil akses endpoint protected!', user: req.user });
// });

module.exports = router;