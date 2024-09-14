//Project Controller
const Project = require("../models/Project");

const createProject = async (req, res, next) => {
  const { projectName, projectCode,projectCategory, address, companyId,siteId, finishDate } =
    req.body;

  if (!projectName || !projectCode ) {
    return res.status(400).json({
      success: false,
      error: "All fields are required",
    });
  }

  try {
    const project = new Project({
      projectName,
      projectCode,
      projectCategory,
      address,
      finishDate,
      site: siteId,
      company: companyId,
    });

    await project.save();
    res.json({
      message: "Proje başarıyla oluşturuldu.",
      project,
    });
  } catch (error) {
    next(error);
  }
};

const getProjects = async (req, res) => {
  const { companyId, siteId } = req.body;
  try {
    const projects = await Project.find({
      company: companyId,
      site: siteId,
    }).populate("site");

    if (!projects.length) {
      return res.status(404).json({
        success: false,
        error: "Bu şirkete ait proje bulunamadı.",
      });
    }
    res.status(200).json({projects});
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: "No project found",
      });
    }
    res.status(200).json({
      project,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

const updateProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.projectId,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!project) {
      return res.status(404).json({
        success: false,
        error: "No project found",
      });
    }
    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: "No project found",
      });
    }
    res.status(200).json({
      success: true,
      message: "project deleted",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
};
