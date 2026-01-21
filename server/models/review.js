const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
  parent: String, // stores the _id of the Study Spot it belongs to
  content: String,
  creator_name: String,
});

module.exports = mongoose.model("review", ReviewSchema);