const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
  creator_id: String,
  creator_name: String,
  content: String,
  rating: Number,
});

const StudySpotSchema = new mongoose.Schema({
  creator_id: String,
  name: String,
  location: String,
  lat: Number,
  lng: Number,
  
  description: String,
  image: String,
  tags: [String],
  reviews: [ReviewSchema],
});

module.exports = mongoose.model("studyspot", StudySpotSchema);