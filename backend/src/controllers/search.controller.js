const searchService = require('../services/search.service')

const searchMUA = async (req, res) => {
  try {
    // Query params dari URL, contoh: /api/search?location=Jakarta&style=Bridal
    const filters = {
        location: req.query.location,
        style: req.query.style,
        specialization: req.query.specialization, // ← tambah ini
        minPrice: req.query.minPrice,
        maxPrice: req.query.maxPrice,
        minRating: req.query.minRating,
        date: req.query.date,
        skinprep: req.query.skinprep
    }

    // requestingUserId opsional — kalau klien login, skin compatibility ikut dihitung
    const requestingUserId = req.user ? req.user.userId : null

    const result = await searchService.searchMUA(filters, requestingUserId)
    res.json({ success: true, data: result, total: result.length })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
}

module.exports = { searchMUA }