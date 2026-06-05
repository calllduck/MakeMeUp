const scheduleService = require('../services/schedule.service')

const createSchedule = async (req, res) => {
  try {
    const { date, startTime, endTime } = req.body
    if (!date || !startTime || !endTime) {
      return res.status(400).json({ success: false, message: 'Field wajib: date, startTime, endTime' })
    }
    const result = await scheduleService.createSchedule(req.user.userId, req.body)
    res.status(201).json({ success: true, message: 'Jadwal berhasil ditambahkan', data: result })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
}

const getMySchedules = async (req, res) => {
  try {
    const result = await scheduleService.getMySchedules(req.user.userId)
    res.json({ success: true, data: result })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
}

const deleteSchedule = async (req, res) => {
  try {
    await scheduleService.deleteSchedule(req.user.userId, req.params.id)
    res.json({ success: true, message: 'Jadwal berhasil dihapus' })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
}

const toggleBlockSchedule = async (req, res) => {
  try {
    const result = await scheduleService.toggleBlockSchedule(req.user.userId, req.params.id)
    res.json({ success: true, message: `Jadwal berhasil ${result.isBlocked ? 'diblokir' : 'dibuka kembali'}`, data: result })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
}

module.exports = { createSchedule, getMySchedules, deleteSchedule, toggleBlockSchedule }