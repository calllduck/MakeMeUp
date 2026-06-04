const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')

dotenv.config()

// tambah ini
const authRoutes = require('./routes/auth.routes')
const profileRoutes = require('./routes/profile.routes')

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())
app.use('/api/auth', authRoutes)
app.use('/api/profile', profileRoutes)

app.get('/', (req, res) => {
  res.json({ message: 'MakeMeUp! backend is running 🎉' })
})

app.listen(PORT, () => {
  console.log(`Server jalan di http://localhost:${PORT}`)
})

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}))