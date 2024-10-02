const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {

    name: { type: String },
    surname: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePic: { type: String, default: ""},
    isAdmin: { type: Boolean, default: false },
    roles: { type: String, default: "standard"},
    bio: { type: String },
    phonenumber: { type: String, default: "" },
    profession: { type: String },
    extras: {type: Array },  
    approve: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);