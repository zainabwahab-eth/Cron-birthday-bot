const express = require("express");
const viewController = require("../controllers/viewController.js");

const router = express.Router();

router.get("/", viewController.getDashboadPage);

module.exports = router;
