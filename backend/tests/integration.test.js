const request = require('supertest')
const app = require('../src/app')

describe('Integration: Auth → Profile Flow', () => {
  let token

  // Login dulu sebelum test profile
  beforeAll(async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'anisa.client@test.com',
      password: 'password123'
    })
    token = res.body.data.token
  })

  // IT-01: Token berhasil didapat dari login
  test('IT-01: Login menghasilkan valid token', () => {
    expect(token).toBeDefined()
    expect(typeof token).toBe('string')
  })

  // IT-02: Akses profile dengan token valid
  test('IT-02: GET /api/profile/client – dengan token valid', async () => {
    const res = await request(app)
      .get('/api/profile/client')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })

  // IT-03: Akses profile tanpa token harus 401
  test('IT-03: GET /api/profile/client – tanpa token harus 401', async () => {
    const res = await request(app)
      .get('/api/profile/client')
    expect(res.status).toBe(401)
  })

  // IT-04: Akses profile dengan token salah harus 401
  test('IT-04: GET /api/profile/client – token invalid harus 401', async () => {
    const res = await request(app)
      .get('/api/profile/client')
      .set('Authorization', 'Bearer tokenpalsu123')
    expect(res.status).toBe(401)
  })
})