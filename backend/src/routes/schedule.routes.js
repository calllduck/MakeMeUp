const express = require('express')
const router = express.Router()
const scheduleController = require('../controllers/schedule.controller')
const { authenticate, authorize } = require('../middleware/auth.middleware')

router.use(authenticate)
router.use(authorize('mua'))

router.post('/', scheduleController.createSchedule)
router.get('/', scheduleController.getMySchedules)
router.delete('/:id', scheduleController.deleteSchedule)
router.patch('/:id/block', scheduleController.toggleBlockSchedule)

module.exports = router