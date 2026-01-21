const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  googleid: String,
  given_name: String,
  family_name: String,
  email: String,
  reviews: { type: Number, default: 0 },
  following: { type: Number, default: 0 },
  followers: { type: Number, default: 0 },
});

// compile model from schema
module.exports = mongoose.model("user", UserSchema);
