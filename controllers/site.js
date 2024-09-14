const Site = require("../models/Site");

const createSite = async (req, res, next) => {
  const { siteName, siteCode, logo, companyId, finishDate } = req.body;

  if (!siteName || !siteCode) {
    return res.status(400).json({
      success: false,
      error: "All fields are required",
    });
  }

  try {
    const site = new Site({
      siteName,
      siteCode,
      logo,
      finishDate,
      company: companyId,
    });

    await site.save();
    res.json({
      message: "Şantiye başarıyla oluşturuldu.",
      site,
    });
  } catch (error) {
    next(error);
  }
};

const getSites = async (req, res) => {
  const { companyId } = req.body;
  try {
    const sites = await Site.find({ company: companyId });

    if (!sites.length) {
      return res.status(404).json({
        success: false,
        error: "Bu şirkete ait proje bulunamadı.",
      });
    }
    res.status(200).json({ sites });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

const getSite = async (req, res) => {
  try {
    const site = await Site.findById(req.params.siteId);
    if (!site) {
      return res.status(404).json({
        success: false,
        error: "No site found",
      });
    }
    res.status(200).json({
      site,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

const deleteSite = async (req, res) => {
  try {
    const site = await Site.findByIdAndDelete(req.params.siteId);
    if (!site) {
      return res.status(404).json({
        success: false,
        error: "No site found",
      });
    }
    res.status(200).json({
      success: true,
      message: "site deleted",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  createSite,
  getSites,
  getSite,
  deleteSite,
};