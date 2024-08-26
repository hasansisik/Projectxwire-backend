const express = require("express");
const {
  register,
  login,
  getMyProfile,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
  againEmail,
  editProfile,
  allUsers,
  sendPushNotification,
} = require("../controllers/auth");
const { isAuthenticated } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", isAuthenticated, getMyProfile);
router.get("/logout", isAuthenticated, logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/verify-email", verifyEmail);
router.post("/again-email", againEmail);
router.post("/edit-profile", isAuthenticated, editProfile);
router.get("/users/:companyId",allUsers);
router.post("/send-push-notification", sendPushNotification);

module.exports = router;
