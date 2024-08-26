const express = require("express");
const {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  addMessageToTask,
  getTaskMessages,
  getFiles,
  taskPersonsAdd,
  deleteSingleMessage,
} = require("../controllers/task");

const router = express.Router();

router.route("/:projectId").post(createTask).get(getTasks);

router
  .route("/single/:taskId")
  .post(taskPersonsAdd)
  .get(getTask)
  .put(updateTask)
  .delete(deleteTask);

router.route("/:taskId/messages").post(addMessageToTask).get(getTaskMessages);

router.get("/projects/:projectId/files", getFiles);

router.route("/:taskId/messages/:messageId").delete(deleteSingleMessage);

module.exports = router;
