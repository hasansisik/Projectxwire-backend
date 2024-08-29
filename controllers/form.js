//Form Controller
const Form = require("../models/Form");
const Project = require("../models/Project");
const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const { ref, uploadBytes, getDownloadURL } = require("firebase/storage");
const { storage } = require("../config");
const PDFDocument = require("pdfkit");
const { Buffer } = require("buffer");
const axios = require("axios");

const createForm = async (req, res) => {
  const { formCategory, formTitle, formDescription, formPerson, formCreator } =
    req.body;
  const project = await Project.findById(req.params.projectId);
  try {
    const formCreators = await User.findById(formCreator);
    const formPersons = await User.findById(formPerson);

    console.log(project.logo);

    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const buffers = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", async () => {
      const pdfBuffer = Buffer.concat(buffers);
      const pdfFileName = `${formTitle.replace(/\s+/g, "_")}.pdf`;
      const pdfRef = ref(storage, `forms/${pdfFileName}`);
      await uploadBytes(pdfRef, pdfBuffer);
      const pdfUrl = await getDownloadURL(pdfRef);
      const formCount = await Form.countDocuments({ project: project._id });
      const newForm = new Form({
        formCategory,
        formTitle,
        formDescription,
        formCreator,
        formPerson,
        number: formCount + 1,
        document: pdfUrl,
        project: project,
      });
      await newForm.save();
      const newForms = await Form.findById(newForm._id)
        .populate("formCreator")
        .populate("formPerson");
      res.status(StatusCodes.CREATED).json(newForms);
    });
    doc.font("public/fonts/medium.otf");

    const response = await axios.get(project.logo, {
      responseType: "arraybuffer",
    });
    const logoBuffer = Buffer.from(response.data, "binary");
    doc.image(logoBuffer, 50, 0, { width: 100 });
    doc.moveDown(2);

    // Date and Title
    const currentDate = new Date().toLocaleDateString("tr-TR");
    doc.fillColor("black").fontSize(14).text(currentDate, 60, 100);

    doc.fillColor("black").moveTo(50, 120).lineTo(150, 120).stroke();

    doc.fillColor("red").fontSize(20).text(formTitle, 215, 96);

    // Balck Line
    doc.fillColor("black").moveTo(200, 120).lineTo(550, 120).stroke();

    // Description section
    doc
      .font("public/fonts/medium.otf")
      .moveDown(1)
      .fontSize(12)
      .fillColor("black")
      .text("Açıklamalar:", 50, doc.y + 20);
    doc
      .font("public/fonts/regular.otf")
      .moveDown(0.5)
      .fontSize(10)
      .text(formDescription || "[Metni buradan başlatın.]", 50, doc.y + 10);

    // Images and signature section
    doc
      .font("public/fonts/medium.otf")
      .fontSize(12)
      .text("Elektronik İmza:", 50, 525);

    const signatureY = 550;
    // Left signature box
    doc.rect(50, signatureY, 250, 100).stroke();
    doc
      .font("public/fonts/bold.otf")
      .fontSize(10)
      .text(formCreators.name, 150, signatureY + 50);
    // Right signature box
    doc.rect(300, signatureY, 250, 100).stroke();
    doc
      .font("public/fonts/bold.otf")
      .fontSize(10)
      .text(formPersons.name, 300, signatureY + 50, { align: "center" });

    doc
      .font("public/fonts/regular.otf")
      .fontSize(10)
      .text("Hazırlayan", 150, signatureY + 30);
    doc
      .fontSize(10)
      .text("Onaylayan", 300, signatureY + 30, { align: "center" });

    // Footer
    doc.fillColor("black").moveTo(50, 710).lineTo(425, 710).stroke();

    doc.font("public/fonts/bold.otf").fontSize(8).text("Telefon", 50, 720);
    doc.font("public/fonts/bold.otf").text("Adres", 150, 720);
    doc.font("public/fonts/bold.otf").text("E-posta", 340, 720);

    doc
      .font("public/fonts/regular.otf")
      .fontSize(8)
      .text("+90 532 351 06 87", 50, 730);
    doc
      .font("public/fonts/regular.otf")
      .text(
        "Merkez Efendi Mh. Mevlana Cd. Tercuman Sit. Bina: A6 No: 26 Zeytinburnu/İstanbul",
        150,
        730,
        { width: 175 }
      );
    doc.text("destek@planwire.com", 340, 730);

    doc
      .fillColor("black")
      .moveTo(50, doc.y + 15)
      .lineTo(425, doc.y + 15)
      .stroke();

    doc.image("public/planwirelogo.png", 450, 715, { width: 100 });

    doc.end();
  } catch (error) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ success: false, error: error.message });
  }
};

const getForms = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const forms = await Form.find({ project: projectId })
      .populate("formCreator")
      .populate("formPerson");
    if (!forms.length) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        error: "Bu projeye ait form bulunamadı.",
      });
    }
    res.status(StatusCodes.OK).json({
      forms,
    });
  } catch (error) {
    throw new CustomError(StatusCodes.BAD_REQUEST, error.message);
  }
};

const getForm = async (req, res) => {
  try {
    const form = await Form.findById(req.params.formId);
    if (!form) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        error: "Form bulunamadı.",
      });
    }
    res.status(StatusCodes.OK).json({
      form,
    });
  } catch (error) {
    throw new CustomError(StatusCodes.BAD_REQUEST, error.message);
  }
};

const updateForm = async (req, res) => {
  try {
    const form = await Form.findByIdAndUpdate(req.params.formId, req.body, {
      new: true,
      runValidators: true,
    });
    if (!form) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        error: "Form bulunamadı.",
      });
    }
    res.status(StatusCodes.OK).json({
      success: true,
      data: form,
    });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      error: error.message,
    });
  }
};

const deleteForm = async (req, res) => {
  try {
    const form = await Form.findByIdAndDelete(req.params.formId);
    if (!form) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        error: "Form bulunamadı.",
      });
    }
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Form silindi.",
    });
  } catch (error) {
    throw new CustomError(StatusCodes.BAD_REQUEST, error.message);
  }
};

module.exports = {
  createForm,
  getForms,
  getForm,
  updateForm,
  deleteForm,
};
