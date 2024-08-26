const Form = require("../models/Form");
const Plan = require("../models/Plan");
const Task = require("../models/Task")

const searchPlanService = async (keyword, projectId) => {
  const query = {
    $or: [
      { planName: { $regex: keyword, $options: "i" } },
      { planCode: { $regex: keyword, $options: "i" } },
      { category: { $regex: keyword, $options: "i" } },
    ],
    project: projectId,
  };

  const plans = await Plan.find(query);
  return plans;
};

const searchTaskService = async (keyword, projectId) => {
  const query = {
    $or: [
      { taskTitle: { $regex: keyword, $options: "i" } },
      { taskCategory: { $regex: keyword, $options: "i" } },
    ],
    project: projectId,
  };

  const tasks = await Task.find(query)
    .populate("persons")
    .populate("taskCreator")
    .populate("plan");
  return tasks;
};

const searchFormService = async (keyword, projectId) => {
  const query = {
    $or: [
      { formTitle: { $regex: keyword, $options: "i" } },
      { formDescription: { $regex: keyword, $options: "i" } },
      { formCategory: { $regex: keyword, $options: "i" } },
    ],
    project: projectId,
  };

  const forms = await Form.find(query)
    .populate("formCreator")
    .populate("formPerson")
  return forms;
};

module.exports = {
  searchPlanService,
  searchTaskService,
  searchFormService,
};
