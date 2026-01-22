const mongoose = require("mongoose");

const StudySpotSchema = new mongoose.Schema({
  name: String,
  location: String,
  description: String,
  image: String, 
  tags: [String],
  creator_id: String, // To allow only the creator to edit/delete
  reviews: [{
    creator_name: String,
    content: String,
    rating: Number,
    timestamp: { type: Date, default: Date.now }
  }]
});

module.exports = mongoose.model("studyspot", StudySpotSchema, "studyspots");