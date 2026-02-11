const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");

router.get("/dashboard", auth, role("customer"), require("../controllers/customer.controller").getDashboard);

module.exports = router;
