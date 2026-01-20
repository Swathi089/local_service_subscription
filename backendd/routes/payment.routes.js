const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const {
  makePayment
} = require("../controllers/payment.controller");

router.post(
  "/pay",
  auth,
  makePayment
);

module.exports = router;
