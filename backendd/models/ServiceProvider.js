const mongoose = require("mongoose");

module.exports = mongoose.model("ServiceProvider", new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  serviceType: String,
  approved: { type: Boolean, default: false }
}));
