const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PinSchema = new Schema({
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  task: { type: Schema.Types.ObjectId, ref: "Task", required: true }
});

const PlanSchema = new Schema(
  {
    planCategory: { type: String, required: true },
    planCode: { type: String, required: true },
    planName: { type: String, required: true },
    planImages: { type: String, required: true },
    project: { type: Schema.Types.ObjectId, ref: "Project" },
    pins: [PinSchema]
  },
  { timestamps: true }
);

const Plan = mongoose.model("Plan", PlanSchema);

module.exports = Plan;