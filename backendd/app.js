const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

/* =====================
   MIDDLEWARE
===================== */

// CORS Configuration
app.use(cors({
  origin: "*", // allow frontend access
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// Parse JSON request body
app.use(express.json());

/* =====================
   ROUTES
===================== */

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/customer", require("./routes/customer.routes"));
app.use("/api/provider", require("./routes/provider.routes"));
app.use("/api/subscription", require("./routes/subscription.routes"));
app.use("/api/payment", require("./routes/payment.routes"));
app.use("/api/admin", require("./routes/admin.routes"));

/* =====================
   ERROR HANDLER
===================== */app.get("/", (req, res) => {
  res.send("🚀 Local Service Subscription Backend is Running");
});


app.use(require("./middleware/error.middleware"));

module.exports = app;
