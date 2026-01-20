const mongoose = require("mongoose");

module.exports = mongoose.model("Review", new mongoose.Schema({
  customerId: mongoose.Schema.Types.ObjectId,
  rating: Number,
  comment: String
}));
