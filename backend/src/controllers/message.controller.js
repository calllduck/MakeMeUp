const messageService = require('../services/message.service')
const { sendSuccess, sendError } = require('../utils/response')

const sendMessage = async (req, res) => {
  try {
    const { receiverId, muaProfileId, content } = req.body
    const message = await messageService.sendMessage(
      req.user.userId, receiverId, parseInt(muaProfileId), content
    )
    sendSuccess(res, message, 'Pesan terkirim', 201)
  } catch (err) {
    console.error('sendMessage error:', err)
    sendError(res, err.message)
  }
}

const getConversation = async (req, res) => {
  try {
    const { muaProfileId, otherUserId } = req.query
    console.log('getConversation params:', { muaProfileId, otherUserId })
    const messages = await messageService.getConversation(
      req.user.userId, otherUserId, parseInt(muaProfileId)
    )
    sendSuccess(res, messages)
  } catch (err) {
    sendError(res, err.message)
  }
}

const getInbox = async (req, res) => {
  try {
    const inbox = await messageService.getInbox(req.user.userId)
    sendSuccess(res, inbox)
  } catch (err) {
    sendError(res, err.message)
  }
}

module.exports = { sendMessage, getConversation, getInbox }