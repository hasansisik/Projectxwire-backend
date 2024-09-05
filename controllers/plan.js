//Plan Controller
const Plan = require("../models/Plan");
const Project = require("../models/Project");
const { StatusCodes } = require("http-status-codes");
const { ref, uploadBytes, getDownloadURL } = require("firebase/storage");
const { storage } = require("../config");
const sanitize = require("sanitize-filename");
var convertapi = require("convertapi")("secret_HVAv6C03H5rsOl6s");
const fs = require("fs");
const path = require("path");
const os = require("os");

const turkishToEnglish = (str) => {
  return str
    .replace(/Ğ/g, "G")
    .replace(/Ü/g, "U")
    .replace(/Ş/g, "S")
    .replace(/İ/g, "I")
    .replace(/Ö/g, "O")
    .replace(/Ç/g, "C")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-zA-Z0-9\s.,(){}\[\]!?\%&$^#\-_*\/\\]/g, "_");
};

const createPlan = async (req, res) => {
  const { planCategory, planCode, planName, projectId } = req.body;
  const planImages = req.file;

  if (!planImages) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      error: "Plan görseli yüklenmedi.",
    });
  }

  const project = await Project.findById(projectId);

  if (!planCategory || !planCode || !planName || !project) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ success: false, error: "Tüm alanlar zorunludur." });
  }

  try {
    let imageBuffer = planImages.buffer;
    let safeFileName = turkishToEnglish(planImages.originalname);
    safeFileName = sanitize(safeFileName);
    let downloadURL;

    if (planImages.mimetype === "application/pdf") {
      const tmpDir = os.tmpdir();
      const pdfPath = path.join(tmpDir, safeFileName);
      const jpgPath = path.join(tmpDir, `${safeFileName}.jpg`);

      await fs.promises.writeFile(pdfPath, imageBuffer);

      const convertResult = await convertapi.convert(
        "jpg",
        { File: pdfPath },
        "pdf"
      );
      const convertedFile = await convertResult.file.save(jpgPath);
      const storageRef = ref(storage, `ProjectxwirePlan/${safeFileName}.jpg`);
      const convertedBuffer = await fs.promises.readFile(jpgPath);
      await uploadBytes(storageRef, convertedBuffer);
      downloadURL = await getDownloadURL(storageRef);

      await fs.promises.unlink(pdfPath);
      await fs.promises.unlink(jpgPath);
    } else {
      const storageRef = ref(storage, `ProjectxwirePlan/${safeFileName}`);
      await uploadBytes(storageRef, imageBuffer);
      downloadURL = await getDownloadURL(storageRef);
    }

    const plan = new Plan({
      planCategory,
      planCode,
      planName,
      planImages: downloadURL,
      project: project,
    });
    await plan.save();

    project.plans.push(plan._id);
    await project.save();

    res.status(StatusCodes.CREATED).json({
      message: "Plan başarıyla oluşturuldu.",
      plan,
    });
  } catch (error) {
    console.log("Error:", error);
    res.status(StatusCodes.BAD_REQUEST).json({
      error: error.message,
      message: "Sistem hatası oluştu. Lütfen tekrar deneyin.",
    });
  }
};


const getPlans = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const plans = await Plan.find({ project: projectId });

    if (!plans.length) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        error: "Bu projeye ait plan bulunamadı.",
      });
    }
    res.status(StatusCodes.OK).json({
      plans,
    });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({
      message: error.message,
    });
  }
};

const getPlan = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.planId);
    if (!plan) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        error: "No plan found",
      });
    }
    res.status(StatusCodes.OK).json({
      plan,
    });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({
      message: error.message,
    });
  }
};

const updatePlan = async (req, res) => {
  try {
    const plan = await Plan.findByIdAndUpdate(req.params.planId, req.body, {
      new: true,
      runValidators: true,
    });
    if (!plan) {
      return res.status(404).json({
        success: false,
        error: "No plan found",
      });
    }
    res.status(200).json({
      success: true,
      data: plan,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

const deletePlan = async (req, res) => {
  try {
    const plan = await Plan.findByIdAndDelete(req.params.planId);
    if (!plan) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        error: "No plan found",
      });
    }
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Plan deleted.",
    });
  } catch (error) {
    console.log("Error:", error);
    res.status(StatusCodes.BAD_REQUEST).json({
      message: error.message,
    });
  }
};

const createPin = async (req, res) => {
  const { planId } = req.params;
  const { x, y, task } = req.body;

  if (!x || !y || !planId) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      error: "X, Y koordinatları ve planId alanları zorunludur.",
    });
  }

  try {
    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        error: "Belirtilen plan bulunamadı.",
      });
    }

    plan.pins.push({ x, y, task });
    await plan.save();

    res
      .status(StatusCodes.CREATED)
      .json({ pin: { x, y, task: req.body.task } });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      error: error.message,
    });
  }
};

const getPins = async (req, res) => {
  const { planId } = req.params;
  try {
    const plan = await Plan.findById(planId).populate({
      path: "pins.task",
      populate: [
        { path: "plan" },
        { path: "taskCreator" },
        { path: "persons" },
        {
          path: "messages.sender",
        },
      ],
    });

    if (!plan) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        error: "Belirtilen plan bulunamadı.",
      });
    }

    res.status(StatusCodes.OK).json({
      success: true,
      pins: plan.pins,
    });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  createPlan,
  getPlans,
  getPlan,
  updatePlan,
  deletePlan,
  createPin,
  getPins,
};
