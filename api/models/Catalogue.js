const mongoose = require("mongoose");

const CatalogueSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    information: { type: String },
    salescode: { type: String },
    suppliercode: { type: String },
    salestag: {type: Boolean, default: false },
    barcodeIds: { type: Array },
    tokentrade: { type: String },
    tokentradeActive: {type: Boolean, default: false }, //if the external trade is open 
    userIds: { type: Array },
    classification: { type: Array },
    broadsheeting: {type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Catalogue", CatalogueSchema);

//broadsheeting
//Display ackermens broadsheet on this catalogue