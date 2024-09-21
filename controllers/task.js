//Task Controller
const Task = require("../models/Task");
const Project = require("../models/Project");
const User = require("../models/User");
const Plan = require("../models/Plan");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const sendFCMNotification = require("../helpers/sendFCMNotification");

const createTask = async (req, res) => {
  const { taskCategory, taskTitle, taskDesc, taskCreator, persons, plan } =
    req.body;
  const project = await Project.findById(req.params.projectId);

  if (
    !taskCategory ||
    !taskTitle ||
    !taskDesc ||
    !taskCreator ||
    !persons ||
    !plan
  ) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ success: false, error: "All fields are required" });
  }

  try {
    const taskCount = await Task.countDocuments({ project: project._id });

    const task = new Task({
      taskCategory,
      taskTitle,
      taskDesc,
      taskCreator,
      persons: Array.isArray(persons) ? persons : [persons],
      plan: plan,
      project: project,
      number: taskCount + 1,
    });

    await task.save();

    const tasks = await Task.findById(task._id)
      .populate("taskCreator")
      .populate("persons")
      .populate("plan");

    // Notification Send
    const message = `Yeni görev oluşturuldu: ${taskTitle}`;
    if (Array.isArray(persons) && persons.length > 0) {
      persons.forEach(async (person) => {
        const user = await User.findById(person);
        if (user && user.expoPushToken) {
          await sendFCMNotification(user.expoPushToken, message);
        }
      });
    }

    res.status(StatusCodes.CREATED).json(tasks);
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.BAD_REQUEST).json({
      message: "Sistem hatası oluştu. Lütfen tekrar deneyin.",
    });
  }
};

const getTasks = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const tasks = await Task.find({ project: projectId })
      .populate("taskCreator")
      .populate("plan")
      .populate("persons")
      .populate("messages.sender");

    if (!tasks.length) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        error: "Bu projeye ait task bulunamadı.",
      });
    }
    res.status(StatusCodes.OK).json({
      tasks,
    });
  } catch (error) {
    throw new CustomError(StatusCodes.BAD_REQUEST, error.message);
  }
};

const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId)
      .populate("taskCreator")
      .populate("plan")
      .populate("persons")
      .populate("messages.sender");

    if (!task) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        error: "No task found",
      });
    }
    res.status(StatusCodes.OK).json({
      task,
    });
  } catch (error) {
    throw new CustomError(StatusCodes.BAD_REQUEST, error.message);
  }
};

const updateTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.taskId, req.body, {
      new: true,
      runValidators: true,
    });
    if (!task) {
      return res.status(404).json({
        success: false,
        error: "No task found",
      });
    }
    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.taskId);
    if (!task) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        error: "No task found",
      });
    }

    const plan = await Plan.findOne({ "pins.task": req.params.taskId });
    if (plan) {
      plan.pins = plan.pins.filter(
        (pin) => pin.task.toString() !== req.params.taskId
      );
      await plan.save();
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Task and associated pin deleted.",
    });
  } catch (error) {
    throw new CustomError(StatusCodes.BAD_REQUEST, error.message);
  }
};

const addMessageToTask = async (req, res) => {
  const { taskId } = req.params;
  const { content, senderId, files } = req.body;
  const sender = await User.findById(senderId);
  try {
    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        error: "Task not found",
      });
    }

    const newMessage = {
      sender,
      content,
      files: files || [],
    };

    task.messages.push(newMessage);
    await task.save();
    res.status(StatusCodes.CREATED).json(newMessage);
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({
      message: "System error. Please try again.",
    });
  }
};

const getTaskMessages = async (req, res) => {
  const { taskId } = req.params;

  try {
    const task = await Task.findById(taskId).populate("messages.sender");

    if (!task) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        error: "Task not found",
      });
    }

    res.status(StatusCodes.OK).json(task.messages);
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({
      message: "System error. Please try again.",
    });
  }
};

const deleteSingleMessage = async (req, res) => {
  const { taskId, messageId } = req.params;

  try {
    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        error: "Task not found",
      });
    }

    const messageIndex = task.messages.findIndex(
      (message) => message._id.toString() === messageId
    );

    if (messageIndex === -1) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        error: "Message not found",
      });
    }

    task.messages.splice(messageIndex, 1);
    await task.save();

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Message deleted from the task",
    });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({
      message: "System error. Please try again.",
    });
  }
};

const getFiles = async (req, res) => {
  const { projectId } = req.params;

  try {
    const tasks = await Task.find({ project: projectId }).populate(
      "messages.sender"
    );

    if (!tasks || tasks.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        error: "No tasks found for this project",
      });
    }

    const files = tasks.reduce((acc, task) => {
      task.messages.forEach((message) => {
        if (message.files && message.files.length > 0) {
          acc.push(...message.files);
        }
      });
      return acc;
    }, []);

    res.status(StatusCodes.OK).json({ files });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({
      message: "System error. Please try again.",
    });
  }
};

const taskPersonsAdd = async (req, res) => {
  const { userId } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Kullanıcı bulunamadı." });
    }

    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Görev bulunamadı." });
    }

    if (task.persons.includes(userId)) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Kullanıcı zaten göreve eklenmiş." });
    }

    task.persons.push(userId);
    await task.save();

    res.status(StatusCodes.OK).json(task);
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Bir hata oluştu.", error: error.message });
  }
};

module.exports = {
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
};
