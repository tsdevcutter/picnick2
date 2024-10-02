const mongoose = require("mongoose");

const AchermansSchema = new mongoose.Schema(
  {
    stockcode: { type: String},
    barcode: { type: String},
    title: { type: String},
    price: { type: String},
    amt: { type: String},
    stamt: { type: String},
  },
  { timestamps: true }
);

module.exports = mongoose.model("Achermans", AchermansSchema);