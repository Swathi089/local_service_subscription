const mongoose = require("mongoose");

module.exports = mongoose.model("Subscription", new mongoose.Schema({
  customerId: mongoose.Schema.Types.ObjectId,
  serviceId: mongoose.Schema.Types.ObjectId,
  status: String
}));
