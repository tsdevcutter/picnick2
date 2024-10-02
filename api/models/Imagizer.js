const mongoose = require("mongoose");
//TESTING MODEL Only for testing Picures schemea
const ImagizerSchema = new mongoose.Schema(
  {
    barcode: { type: String, required: true, unique: true },
    title: { type: String , required: true},
    imgurl: { type: String , required: true},
    key: { type: String },
    imgLeft: { type: String },
    imgRight: { type: String },
    imgUnpack: { type: String },
    onlineDesc: { type: String },
    description: { type: String },
    size: { type: String },
    feature: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Imagizer", ImagizerSchema);