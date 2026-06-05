import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
})

// Interceptor — otomatis sisipkan token ke setiap request
// Jadi tidak perlu manual tambah header Authorization di setiap pemanggilan
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Package API
export const packageAPI = {
  getPackages: () => api.get('/packages'),
  createPackage: (data) => api.post('/packages', data),
  updatePackage: (id, data) => api.put(`/packages/${id}`, data),
  deletePackage: (id) => api.delete(`/packages/${id}`),
  getAddons: () => api.get('/packages/addons'),
  createAddon: (data) => api.post('/packages/addons', data),
  deleteAddon: (id) => api.delete(`/packages/addons/${id}`)
}

// Schedule API
export const scheduleAPI = {
  getSchedules: () => api.get('/schedules'),
  createSchedule: (data) => api.post('/schedules', data),
  deleteSchedule: (id) => api.delete(`/schedules/${id}`),
  toggleBlock: (id) => api.patch(`/schedules/${id}/block`)
}

// Search & MUA detail API
export const searchAPI = {
  searchMUA: (params) => api.get('/search', { params }),
  getMuaDetail: (id) => api.get(`/mua/${id}`)
}

// Booking API
export const bookingAPI = {
  createBooking: (data) => api.post('/bookings', data),
  getBookings: () => api.get('/bookings'),
  getBookingById: (id) => api.get(`/bookings/${id}`),
  respondToBooking: (id, data) => api.patch(`/bookings/${id}/respond`, data)
}

export const paymentAPI = {
  createPayment: (bookingId) => api.post(`/payment/bookings/${bookingId}/pay`)
}

export default api