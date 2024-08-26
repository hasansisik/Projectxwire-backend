const express = require("express");
const { companyRegister, companyLogin } = require("../controllers/company");

const router = express.Router();

router.route("/register").post(companyRegister)
router.route("/login").post(companyLogin);

module.exports = router;
