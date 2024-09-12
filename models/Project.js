const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProjectSchema = new Schema(
  {
    projectName: { type: String, required: true },
    projectCode: { type: String },
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
    logo: {
      type: String,
      default:
        "https://firebasestorage.googleapis.com/v0/b/projectxwire-e951a.appspot.com/o/logo-black.png?alt=media&token=d0bedb77-5329-4c92-8ed3-6270bb3fad7e",
    },
    plans: [{ type: Schema.Types.ObjectId, ref: "Plan", default: [] }],
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
