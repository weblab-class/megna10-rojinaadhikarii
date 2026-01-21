const mongoose = require("mongoose");

const StudySpotSchema = new mongoose.Schema({
  name: String,
  location: String,
  description: String,
  image: String, 
  tags: [String],
});

module.exports = mongoose.model("studyspot", StudySpotSchema, "studyspots");