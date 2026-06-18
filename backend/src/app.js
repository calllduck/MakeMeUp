const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')

dotenv.config()

const authRoutes = require('./routes/auth.routes')
const profileRoutes = require('./routes/profile.routes')
const packageRoutes = require('./routes/package.routes')
const scheduleRoutes = require('./routes/schedule.routes')
const searchRoutes = require('./routes/search.routes')
const muaRoutes = require('./routes/mua.routes')
const bookingRoutes = require('./routes/booking.routes')
const paymentRoutes = require('./routes/payment.routes')
const reviewRoutes = require('./routes/review.routes')
const messageRoutes = require('./routes/message.routes')
const portfolioRoutes = require('./routes/portfolio.routes')

const app = express()

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'https://makemeup.up.railway.app'],
  credentials: true,
}))
app.use(express.json())
app.use('/uploads', express.static(require('path').join(__dirname, '../uploads')))
app.use('/api/auth', authRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/packages', packageRoutes)
app.use('/api/schedules', scheduleRoutes)
app.use('/api/search', searchRoutes)
app.use('/api/mua', muaRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/payment', paymentRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/portfolio', portfolioRoutes)

app.get('/', (req, res) => {
  res.json({ message: 'MakeMeUp! backend is running 🎉' })
})

module.exports = app