const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProjectSchema = new Schema(
  {
    projectName: { type: String, required: true },
    projectCode: { type: String },
    address: { type: String },
    logo: {
      type: String,
      default:
        "https://firebasestorage.googleapis.com/v0/b/planwire-9e539.appspot.com/o/planwirelogo.png?alt=media&token=ac8f0a2a-82d4-449d-be96-d43c714b09ad",
    },
    plans: [{ type: Schema.Types.ObjectId, ref: "Plan", default: [] }],
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
  },
  { timestamps: true }
);

const Project = mongoose.model("Project", ProjectSchema);

module.exports = Project;
