const express = require('express');
const { searchPlan,searchTask, searchForm } = require('../controllers/search');

const router = express.Router();

router.route("/plan")
    .get(searchPlan)

router.route("/task")
    .get(searchTask)

router.route("/form")
    .get(searchForm)

module.exports = router;