const express = require('express')
const router = express.Router()
const { authenticate } = require('../middleware/auth.middleware')
const { sendMessage, getConversation, getInbox } = require('../controllers/message.controller')

router.post('/', authenticate, sendMessage)
router.get('/conversation', authenticate, getConversation)
router.get('/inbox', authenticate, getInbox)

module.exports = router