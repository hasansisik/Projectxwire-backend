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

const createForm = async (req, res) => {
  const { formCategory, formTitle, formDescription, formPerson, formCreator } =
    req.body;
  const project = await Project.findById(req.params.projectId);
  try {
    const formCreators = await User.findById(formCreator);
    const formPersons = await User.findById(formPerson);
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

    doc.image("public/planwirelogo.png", 50, 45, { width: 100 });
    doc.moveDown(2);

    // Date and Title
    const currentDate = new Date().toLocaleDateString("tr-TR");
    doc.fillColor("black").fontSize(14).text(currentDate, 60, 100);

    doc.fillColor("black").moveTo(50, 120).lineTo(150, 120).stroke();

    doc.fillColor("red").fontSize(24).text(formTitle, 225, 100);

    // Balck Line
    doc.fillColor("black").moveTo(200, 120).lineTo(550, 120).stroke();

    // Description section
    doc
      .moveDown(1)
      .fontSize(12)
      .fillColor("black")
      .text("Açıklamalar:", 50, doc.y + 20);
    doc
      .moveDown(0.5)
      .fontSize(10)
      .text(formDescription || "[Metni buradan başlatın.]", 50, doc.y + 10);

    // Images and signature section
    doc.moveDown(6).fontSize(12).text("Görseller:", 50);

    const signatureY = doc.y + 20;
    // Left signature box
    doc.rect(50, signatureY, 250, 100).stroke();
    doc.fontSize(10).text(formCreators.name, 150, signatureY + 40);
    // Right signature box
    doc.rect(300, signatureY, 250, 100).stroke();
    doc
      .fontSize(10)
      .text(formPersons.name, 300, signatureY + 40, { align: "center" });

    const columnY = signatureY + 120;
    doc.fontSize(10).text("Hazırlayan", 150, columnY);
    doc.fontSize(10).text("Onaylayan", 300, columnY, { align: "center" });

    // Footer
    doc.fontSize(8).text("Telefon", 50, 720);
    doc.text("Adres", 150, 720);
    doc.text("E-posta", 250, 720);
    doc
      .fillColor("black")
      .moveTo(50, doc.y + 10)
      .lineTo(550, doc.y + 10)
      .stroke();
    doc.image("public/planwirelogo.png", 450, 700, { width: 100 });

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
