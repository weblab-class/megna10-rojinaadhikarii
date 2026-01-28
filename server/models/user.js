const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  googleid: String,
  email: String,
  bio: String,
  showEmail: { type: Boolean, default: true },
  
  picture: String,
  
  bookmarked_spots: { type: [String], default: [] },
  reviewCount: { type: Number, default: 0 }, 
  
  following: { type: [String], default: [] },
  followers: { type: [String], default: [] },
  
  tasks: [{ 
    id: String,      
    text: String, 
    completed: Boolean, 
    estimate: Number 
  }]
});

module.exports = mongoose.model("user", UserSchema);