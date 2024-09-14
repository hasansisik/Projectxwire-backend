const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProjectSchema = new Schema(
  {
    projectName: { type: String, required: true },
    projectCode: { type: String },
    projectCategory: { type: String },
    address: { type: String },
    phoneNumber: {
      type: String,
      validate: {
        validator: function (v) {
          return /^(\+90|0)?5\d{9}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid phone number!`,
      },
    },
    plans: [{ type: Schema.Types.ObjectId, ref: "Plan", default: [] }],
    site: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Site",
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
    status: {
      type: Boolean,
      default: true,
    },
    finishDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

const Project = mongoose.model("Project", ProjectSchema);

module.exports = Project;
