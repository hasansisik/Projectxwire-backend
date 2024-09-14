const express = require("express");
const {
  createSite,
  getSites,
  getSite,
  deleteSite,
} = require("../controllers/site");

const router = express.Router();

router.route("/").post(createSite);
router.route("/gets").post(getSites);

router.route("/:siteId").get(getSite).delete(deleteSite);

module.exports = router;
