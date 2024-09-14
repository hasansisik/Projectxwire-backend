const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SiteSchema = new Schema(
  {
    siteName: { type: String, required: true },
    siteCode: { type: String },
    logo: {
      type: String,
      default:
        "https://firebasestorage.googleapis.com/v0/b/projectxwire-e951a.appspot.com/o/logo-black.png?alt=media&token=d0bedb77-5329-4c92-8ed3-6270bb3fad7e",
    },
    projects: [{ type: Schema.Types.ObjectId, ref: "Project", default: [] }],
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

const Site = mongoose.model("Site", SiteSchema);

module.exports = Site;
