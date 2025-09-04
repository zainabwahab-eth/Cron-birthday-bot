const express = require("express");
const customerController = require("../controllers/customerController.js");

const router = express.Router();

router.post("/addCustomers", customerController.addCustomers);
router.post(
  "/uploadCsv",
  customerController.upload.single("csvFile"),
  customerController.uploadCSV
);
router.get("/allCustomer", customerController.getAllCustomers);
router.delete("/delete/:userId", customerController.deleteCustomer);

module.exports = router;
