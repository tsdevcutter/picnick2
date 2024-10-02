const mongoose = require("mongoose");

const TagSchema = new mongoose.Schema(
  {
    tagName: { type: String},
    tagDescription: { type: String }, 
    img_url: {type: String },  
  },
  { timestamps: true }
);

module.exports = mongoose.model("Tag", TagSchema);