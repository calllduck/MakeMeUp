const muaService = require('../services/mua.service')

const getMuaDetail = async (req, res) => {
  try {
    const requestingUserId = req.user ? req.user.userId : null
    const result = await muaService.getMuaDetail(req.params.id, requestingUserId)
    res.json({ success: true, data: result })
  } catch (err) {
    res.status(404).json({ success: false, message: err.message })
  }
}

module.exports = { getMuaDetail }