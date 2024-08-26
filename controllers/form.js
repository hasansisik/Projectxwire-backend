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
    const doc = new PDFDocument();
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
    const currentDate = new Date().toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    doc.fontSize(10).text(currentDate,{ align: "right" });
    doc
      .font("public/fonts/bold.otf")
      .fontSize(20)
      .text(formTitle, { align: "center" });
    doc.moveDown(1);
    doc.font("public/fonts/regular.otf");
    doc.fontSize(15).text(`Kategori: ${formCategory}`, { align: "center" });
    doc.moveDown(1);
    doc.fontSize(15).text(`Açıklama: ${formDescription}`, { align: "center" });
    doc.moveDown(2);
    const creatorTextWidth = doc.widthOfString(
      `Oluşturan: ${formCreators.name}`
    );
    const signerTextWidth = doc.widthOfString(`İmzalayan: ${formPersons.name}`);
    const totalWidth = creatorTextWidth + signerTextWidth + 10; 
    doc
      .font("public/fonts/bold.otf")
      .fontSize(14)
      .text(
        `Oluşturan: ${formCreators.name}`,
        (doc.page.width - totalWidth) / 2,
        doc.y,
        { continued: true }
      );
    doc.text(` İmzalayan: ${formPersons.name}`, { align: "right" });
    doc.end();
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      error: error.message,
    });
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
