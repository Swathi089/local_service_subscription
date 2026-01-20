const mongoose = require("mongoose");

module.exports = mongoose.model("Payment", new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  amount: Number,
  status: String
}));
