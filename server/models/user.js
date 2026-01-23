const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  googleid: String,
  email: String,
  bio: String,
  showEmail: { type: Boolean, default: true },
  
  bookmarked_spots: { type: [String], default: [] },
  
  reviews: { type: Number, default: 0 },
  following: { type: Number, default: 0 },
  followers: { type: Number, default: 0 },
});

module.exports = mongoose.model("user", UserSchema);