const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");
const {
  getAdminStats
} = require("../controllers/admin.controller");

router.get(
  "/dashboard",
  auth,
  role("admin"),
  getAdminStats
);

module.exports = router;
