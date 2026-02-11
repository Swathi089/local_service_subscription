const mongoose = require("mongoose");

module.exports = mongoose.model("Customer", new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  name: String
}));
