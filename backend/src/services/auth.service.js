const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const register = async ({ name, email, password, role, phone }) => {
  // Cek apakah email sudah dipakai
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error('Email sudah terdaftar');
  }

  // Enkripsi password sebelum disimpan
  // Angka 12 = seberapa "berat" proses enkripsinya — makin tinggi makin aman tapi makin lambat
  const hashedPassword = await bcrypt.hash(password, 12);

  // Simpan user baru ke database
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
      phone,
    },
  });

  // Jangan kembalikan password ke response
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

const login = async ({ email, password }) => {
  // Cari user berdasarkan email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  // Kalau tidak ketemu, jangan kasih tahu email-nya salah
  // (alasan keamanan — jangan bocorkan info akun mana yang ada)
  if (!user) {
    throw new Error('Email atau password salah');
  }

  // Bandingkan password yang dikirim dengan yang ada di database
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new Error('Email atau password salah');
  }

  // Cek apakah akun aktif
  if (!user.isActive) {
    throw new Error('Akun kamu tidak aktif');
  }

  // Buat JWT token
  const token = jwt.sign(
    { userId: user.id, role: user.role }, // data yang disimpan di dalam token
    process.env.JWT_SECRET,               // kunci rahasia untuk enkripsi
    { expiresIn: '8h' }                   // token kadaluwarsa setelah 8 jam
  );

  const { password: _, ...userWithoutPassword } = user;

  return {
    token,
    user: userWithoutPassword,
  };
};

module.exports = { register, login };