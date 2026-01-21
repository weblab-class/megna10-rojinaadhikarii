const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  googleid: String,
favorited_spots: [{ type: mongoose.Schema.Types.ObjectId, ref: "studyspot" }],
});

// compile model from schema
module.exports = mongoose.model("user", UserSchema);
