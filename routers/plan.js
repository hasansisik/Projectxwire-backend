const express = require("express");
const {
  createPlan,
  getPlans,
  getPlan,
  updatePlan,
  deletePlan,
  createPin,
  getPins
} = require("../controllers/plan");
const { isAdmin} = require("../middleware/authMiddleware");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

router
  .route("/:projectId")
  .post(upload.single("planImages"), createPlan)
  .get(getPlans);
  
router.route("/pin/:planId").post(createPin).get(getPins);

router
  .route("/single/:planId")
  .get(getPlan)
  .put([isAdmin],updatePlan)
  .delete(deletePlan);

module.exports = router;
