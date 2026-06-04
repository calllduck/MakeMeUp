const authService = require('../services/auth.service');
const { sendSuccess, sendError } = require('../utils/response');

const register = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    // Validasi: semua field wajib diisi
    if (!name || !email || !password || !role || !phone) {
      return sendError(res, 'Semua field wajib diisi', 400);
    }

    // Validasi: role harus salah satu dari tiga pilihan
    if (!['client', 'mua', 'admin'].includes(role)) {
      return sendError(res, 'Role tidak valid', 400);
    }

    // Validasi: password minimal 8 karakter
    if (password.length < 8) {
      return sendError(res, 'Password minimal 8 karakter', 400);
    }

    const user = await authService.register({ name, email, password, role, phone });

    return sendSuccess(res, user, 'Registrasi berhasil', 201);
  } catch (error) {
    if (error.message === 'Email sudah terdaftar') {
      return sendError(res, error.message, 409);
    }
    return sendError(res, 'Terjadi kesalahan server', 500);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 'Email dan password wajib diisi', 400);
    }

    const result = await authService.login({ email, password });

    return sendSuccess(res, result, 'Login berhasil');
  } catch (error) {
    if (
      error.message === 'Email atau password salah' ||
      error.message === 'Akun kamu tidak aktif'
    ) {
      return sendError(res, error.message, 401);
    }
    return sendError(res, 'Terjadi kesalahan server', 500);
  }
};

module.exports = { register, login };