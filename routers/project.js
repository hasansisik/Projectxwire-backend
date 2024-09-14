const express = require("express");
const {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject
} = require("../controllers/project");

const router = express.Router();

router.route("/").post(createProject);
router.route("/gets").post(getProjects);

router
  .route("/:projectId")
  .get(getProject)
  .put(updateProject)
  .delete(deleteProject);

module.exports = router;
