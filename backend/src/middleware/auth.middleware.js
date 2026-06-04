const jwt = require('jsonwebtoken');
const { sendError } = require('../utils/response');

const authenticate = (req, res, next) => {
  // Ambil token dari header request
  // Format header: "Authorization: Bearer eyJhbGc..."
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // ambil bagian setelah "Bearer "

  if (!token) {
    return sendError(res, 'Token tidak ditemukan, silakan login', 401);
  }

  try {
    // Verifikasi token — apakah valid dan belum kadaluwarsa
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Simpan data user dari token ke req.user
    // supaya controller bisa akses info user yang sedang login
    req.user = decoded;

    next(); // lanjut ke controller
  } catch (error) {
    return sendError(res, 'Token tidak valid atau sudah kadaluwarsa', 401);
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return sendError(res, 'Kamu tidak punya akses ke halaman ini', 403);
    }
    next();
  };
};

module.exports = { authenticate, authorize };