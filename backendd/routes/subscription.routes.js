const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");
const {
  createSubscription
} = require("../controllers/subscription.controller");

router.post(
  "/create",
  auth,
  role("customer"),
  createSubscription
);

module.exports = router;
