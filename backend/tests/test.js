const request = require('supertest')
const app = require('../src/app')

describe('Auth API', () => {
  test('POST /api/auth/register - berhasil daftar', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: `test${Date.now()}@example.com`, // ← random biar ga duplicate
      password: 'password123',
      role: 'client',
      phone: '08123456789'
    })
    expect(res.status).toBe(201)
    expect(res.body.data).toHaveProperty('name') // ← fix path
  })

  test('POST /api/auth/login - berhasil login', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'anisa.client@test.com',
      password: 'password123'
    })
    expect(res.status).toBe(200)
    expect(res.body.data).toHaveProperty('token') // ← fix path
  })

  test('POST /api/auth/login - credentials salah harus 401', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'salah@email.com',
      password: 'wrongpass'
    })
    expect(res.status).toBe(401)
  })
})