const profileService = require('../services/profile.service');
const { sendSuccess, sendError } = require('../utils/response');

const getClientProfile = async (req, res) => {
  try {
    // req.user diisi oleh middleware authenticate tadi
    const profile = await profileService.getClientProfile(req.user.userId);

    if (!profile) {
      return sendSuccess(res, null, 'Profil belum diisi');
    }

    return sendSuccess(res, profile, 'Berhasil ambil profil');
  } catch (error) {
    return sendError(res, 'Terjadi kesalahan server', 500);
  }
};

const updateClientProfile = async (req, res) => {
  try {
    const {
      avatarUrl,
      defaultLocation,
      skinType,
      skinTone,
      skinConditions,
      sensitiveIngredients,
      preferredStyles,
      preferredEvents,
    } = req.body;

    // Validasi skinType kalau diisi
    const validSkinTypes = ['normal', 'oily', 'dry', 'combination', 'sensitive'];
    if (skinType && !validSkinTypes.includes(skinType)) {
      return sendError(res, 'Tipe kulit tidak valid', 400);
    }

    const data = {};

    // Hanya masukkan field yang dikirim — kalau tidak dikirim, tidak diupdate
    if (avatarUrl !== undefined) data.avatarUrl = avatarUrl;
    if (defaultLocation !== undefined) data.defaultLocation = defaultLocation;
    if (skinType !== undefined) data.skinType = skinType;
    if (skinTone !== undefined) data.skinTone = skinTone;
    if (skinConditions !== undefined) data.skinConditions = skinConditions;
    if (sensitiveIngredients !== undefined) data.sensitiveIngredients = sensitiveIngredients;
    if (preferredStyles !== undefined) data.preferredStyles = preferredStyles;
    if (preferredEvents !== undefined) data.preferredEvents = preferredEvents;

    const profile = await profileService.upsertClientProfile(req.user.userId, data);

    return sendSuccess(res, profile, 'Profil berhasil diupdate');
  } catch (error) {
    return sendError(res, 'Terjadi kesalahan server', 500);
  }
};

const getMuaProfile = async (req, res) => {
  try {
    const profile = await profileService.getMuaProfile(req.user.userId);

    if (!profile) {
      return sendSuccess(res, null, 'Profil belum diisi');
    }

    return sendSuccess(res, profile, 'Berhasil ambil profil');
  } catch (error) {
    return sendError(res, 'Terjadi kesalahan server', 500);
  }
};

const updateMuaProfile = async (req, res) => {
  try {
    const {
      brandName,
      avatarUrl,
      bio,
      operationalLocation,
      yearsExperience,
      specializations,
      makeupStyles,
      canUseOwnSkinprep,
      canUseClientSkinprep,
      ownSkinprepIngredients,
      transportType,
      transportFlatFee,
      transportPerKmRate,
    } = req.body;

    // Validasi field wajib kalau profil belum ada
    const existingProfile = await profileService.getMuaProfile(req.user.userId);
    if (!existingProfile && (!brandName || !operationalLocation || !specializations || !makeupStyles)) {
      return sendError(res, 'brandName, operationalLocation, specializations, dan makeupStyles wajib diisi', 400);
    }

    // Validasi transportType kalau diisi
    const validTransportTypes = ['flat', 'per_km', 'free'];
    if (transportType && !validTransportTypes.includes(transportType)) {
      return sendError(res, 'Tipe transport tidak valid', 400);
    }

    // Validasi: kalau transportType flat, transportFlatFee wajib diisi
    if (transportType === 'flat' && !transportFlatFee) {
      return sendError(res, 'transportFlatFee wajib diisi untuk tipe flat', 400);
    }

    // Validasi: kalau transportType per_km, transportPerKmRate wajib diisi
    if (transportType === 'per_km' && !transportPerKmRate) {
      return sendError(res, 'transportPerKmRate wajib diisi untuk tipe per_km', 400);
    }

    const data = {};

    if (brandName !== undefined) data.brandName = brandName;
    if (avatarUrl !== undefined) data.avatarUrl = avatarUrl;
    if (bio !== undefined) data.bio = bio;
    if (operationalLocation !== undefined) data.operationalLocation = operationalLocation;
    if (yearsExperience !== undefined) data.yearsExperience = yearsExperience;
    if (specializations !== undefined) data.specializations = specializations;
    if (makeupStyles !== undefined) data.makeupStyles = makeupStyles;
    if (canUseOwnSkinprep !== undefined) data.canUseOwnSkinprep = canUseOwnSkinprep;
    if (canUseClientSkinprep !== undefined) data.canUseClientSkinprep = canUseClientSkinprep;
    if (ownSkinprepIngredients !== undefined) data.ownSkinprepIngredients = ownSkinprepIngredients;
    if (transportType !== undefined) data.transportType = transportType;
    if (transportFlatFee !== undefined) data.transportFlatFee = transportFlatFee === '' ? null : transportFlatFee;
    if (transportPerKmRate !== undefined) data.transportPerKmRate = transportPerKmRate === '' ? null : transportPerKmRate;

    const profile = await profileService.upsertMuaProfile(req.user.userId, data);

    return sendSuccess(res, profile, 'Profil MUA berhasil diupdate');
  } catch (error) {
    console.error('updateMuaProfile error:', error)
    return sendError(res, 'Terjadi kesalahan server', 500);
  }
};

module.exports = { getClientProfile, updateClientProfile, getMuaProfile, updateMuaProfile };