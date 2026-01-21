const mongoose = require("mongoose");

const StudySpotSchema = new mongoose.Schema({
  name: String,
  location: String,
  description: String,
  image: String, 
  tags: [String],
  reviews: [{
    creator_name: String,
    content: String,
    rating: Number,
  }]
});

module.exports = mongoose.model("studyspot", StudySpotSchema, "studyspots");