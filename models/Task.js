const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MessageSchema = new Schema(
  {
    sender: { type: Schema.Types.ObjectId, ref: "User" },
    content: { type: String},
    files: [],
  },
  { timestamps: true }
);

const TaskSchema = new Schema(
  {
    number: { type: Number },
    taskCategory: { type: String },
    taskTitle: { type: String },
    taskTopic: { type: String },
    taskCreator: { type: Schema.Types.ObjectId, ref: "User" },
    persons: [{ type: Schema.Types.ObjectId, ref: "User" }],
    plan: { type: Schema.Types.ObjectId, ref: "Plan" },
    project: { type: Schema.Types.ObjectId, ref: "Project" },
    messages: [MessageSchema],
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", TaskSchema);

module.exports = Task;
