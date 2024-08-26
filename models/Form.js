const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FormSchema = new Schema(
  {
    formCategory: { type: String },
    formTitle: { type: String },
    formDescription: { type: String },
    number: { type: Number },
    document: { type: String },
    formCreator: { type: Schema.Types.ObjectId, ref: "User" },
    formPerson: { type: Schema.Types.ObjectId, ref: "User" },
    project: { type: Schema.Types.ObjectId, ref: "Project" },
  },
  { timestamps: true }
);

const Form = mongoose.model("Form", FormSchema);

module.exports = Form;
