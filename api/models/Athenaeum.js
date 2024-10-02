const mongoose = require("mongoose");

const AthenaeumSchema = new mongoose.Schema(
  {
    barcode: { type: String},
    imgurl: { type: String , required: true},
    key: { type: String },
    imgLeft: { type: String },
    imgRight: { type: String },
    imgUnpack: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Athenaeum", AthenaeumSchema);
/*
List of pictures that Are not assigned to any picture data (title, brand, barcode);
*/