const packageService = require('../services/package.service')

const createPackage = async (req, res) => {
  try {
    const { name, description, basePrice, durationMinutes, includedServices, sortOrder } = req.body
    if (!name || !basePrice || !durationMinutes || !includedServices) {
      return res.status(400).json({ success: false, message: 'Field wajib: name, basePrice, durationMinutes, includedServices' })
    }
    const result = await packageService.createPackage(req.user.userId, req.body)
    res.status(201).json({ success: true, message: 'Paket berhasil dibuat', data: result })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
}

const getMyPackages = async (req, res) => {
  try {
    const result = await packageService.getMyPackages(req.user.userId)
    res.json({ success: true, data: result })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
}

const updatePackage = async (req, res) => {
  try {
    const result = await packageService.updatePackage(req.user.userId, req.params.id, req.body)
    res.json({ success: true, message: 'Paket berhasil diupdate', data: result })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
}

const deletePackage = async (req, res) => {
  try {
    await packageService.deletePackage(req.user.userId, req.params.id)
    res.json({ success: true, message: 'Paket berhasil dihapus' })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
}

const createAddon = async (req, res) => {
  try {
    const { name, price } = req.body
    if (!name || !price) {
      return res.status(400).json({ success: false, message: 'Field wajib: name, price' })
    }
    const result = await packageService.createAddon(req.user.userId, req.body)
    res.status(201).json({ success: true, message: 'Add-on berhasil dibuat', data: result })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
}

const getMyAddons = async (req, res) => {
  try {
    const result = await packageService.getMyAddons(req.user.userId)
    res.json({ success: true, data: result })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
}

const deleteAddon = async (req, res) => {
  try {
    await packageService.deleteAddon(req.user.userId, req.params.id)
    res.json({ success: true, message: 'Add-on berhasil dihapus' })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
}

module.exports = {
  createPackage, getMyPackages, updatePackage,
  deletePackage, createAddon, getMyAddons, deleteAddon
}