const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
  creator_id: String,
  creator_name: String,
  creator_picture: String, 
  content: String,
  rating: Number,
  timestamp: { type: Date, default: Date.now },
});

const StudySpotSchema = new mongoose.Schema({
  creator_id: String,
  creator_name: String, 
  name: String,
  location: String,
  lat: Number,
  lng: Number,
  image: String,
  tags: [String],
  reviews: [ReviewSchema],
});

module.exports = mongoose.model("studyspot", StudySpotSchema);