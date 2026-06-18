import axios from 'axios'

export const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
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

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
}

// Profile
export const profileAPI = {
  getClientProfile: ()     => api.get('/profile/client'),
  updateClientProfile: (data) => api.put('/profile/client', data),
  getMuaProfile: ()        => api.get('/profile/mua'),
  updateMuaProfile: (data) => api.put('/profile/mua', data),
}

// Package & Add-on
export const packageAPI = {
  getPackages:   ()       => api.get('/packages'),
  createPackage: (data)   => api.post('/packages', data),
  updatePackage: (id, data) => api.put(`/packages/${id}`, data),
  deletePackage: (id)     => api.delete(`/packages/${id}`),
  getAddons:     ()       => api.get('/packages/addons'),
  createAddon:   (data)   => api.post('/packages/addons', data),
  deleteAddon:   (id)     => api.delete(`/packages/addons/${id}`),
}

// Schedule
export const scheduleAPI = {
  getSchedules:    ()   => api.get('/schedules'),
  createSchedule:  (data) => api.post('/schedules', data),
  deleteSchedule:  (id) => api.delete(`/schedules/${id}`),
  toggleBlock:     (id) => api.patch(`/schedules/${id}/block`),
}

// Search & MUA detail
export const searchAPI = {
  searchMUA:    (params) => api.get('/search', { params }),
  getMuaDetail: (id)     => api.get(`/mua/${id}`),
}

// Booking
export const bookingAPI = {
  createBooking:     (data)           => api.post('/bookings', data),
  getBookings:       ()               => api.get('/bookings'),
  getBookingById:    (id)             => api.get(`/bookings/${id}`),
  respondToBooking:  (id, data)       => api.patch(`/bookings/${id}/respond`, data),
  cancelBooking:     (id)             => api.patch(`/bookings/${id}/cancel`),
  completeBooking:   (id)             => api.patch(`/bookings/${id}/complete`),
}

// Payment
export const paymentAPI = {
  createPayment: (bookingId) => api.post(`/payment/bookings/${bookingId}/pay`),
}

// Review
export const reviewAPI = {
  createReview:   (data)              => api.post('/reviews', data),
  getMuaReviews:  (muaId)             => api.get(`/reviews/mua/${muaId}`),
  replyReview:    (reviewId, muaReply) => api.patch(`/reviews/${reviewId}/reply`, { muaReply }),
}

// Message
export const messageAPI = {
  sendMessage:     (data)                    => api.post('/messages', data),
  getConversation: (muaProfileId, otherUserId) =>
    api.get('/messages/conversation', { params: { muaProfileId, otherUserId } }),
  getInbox:        ()                        => api.get('/messages/inbox'),
}

// Portfolio
export const portfolioAPI = {
  getPortfolio: (muaProfileId) => api.get(`/portfolio/${muaProfileId}`),
  upload: (formData) =>
    api.post('/portfolio', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: (photoId) => api.delete(`/portfolio/${photoId}`),
}

export default api