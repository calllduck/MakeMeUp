const portfolioService = require('../services/portfolio.service')
const { sendSuccess, sendError } = require('../utils/response')

const getPortfolio = async (req, res) => {
  try {
    const { muaProfileId } = req.params
    const photos = await portfolioService.getPortfolio(muaProfileId)
    return sendSuccess(res, photos, 'Berhasil ambil portofolio')
  } catch (error) {
    return sendError(res, 'Terjadi kesalahan server', 500)
  }
}

const uploadPhoto = async (req, res) => {
  try {
    if (!req.file) return sendError(res, 'File foto wajib diupload', 400)
    const { caption, style } = req.body
    const photo = await portfolioService.uploadPhoto(req.user.userId, req.file, caption, style)
    return sendSuccess(res, photo, 'Foto berhasil diupload', 201)
  } catch (error) {
    console.error('uploadPhoto error:', error)
    return sendError(res, error.message || 'Terjadi kesalahan server', 500)
  }
}

const deletePhoto = async (req, res) => {
  try {
    const { photoId } = req.params
    await portfolioService.deletePhoto(req.user.userId, photoId)
    return sendSuccess(res, null, 'Foto berhasil dihapus')
  } catch (error) {
    return sendError(res, error.message || 'Terjadi kesalahan server', 500)
  }
}

module.exports = { getPortfolio, uploadPhoto, deletePhoto }