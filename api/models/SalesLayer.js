const mongoose = require("mongoose");

const SalesLayerSchema = new mongoose.Schema(
  {
    barcode: { type: String, required: true, unique: true },
    productName: { type: String},//Capitalized Title
    title: { type: String },
    imgurl: { type: String },
    onlineDesc: { type: String },
    description: { type: String },
    idcategory: { type: String },
    vendorName: { type: String },
    hasPhoto: {type: Boolean}
  },
  { timestamps: true }
);

module.exports = mongoose.model("SalesLayer", SalesLayerSchema);