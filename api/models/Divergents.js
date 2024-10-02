const mongoose = require("mongoose");

const DivergentSchema = new mongoose.Schema(
  {
    barcode: { type: String, required: true, unique: true },
    title: { type: String , required: true},
    stockcode: { type: String },
    price: { type: String },
    qty: { type: String },
    promotion: { type: String },
    digit: { type: String },
    schedule: {type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Divergent", DivergentSchema);
/*
 *
Store pictures that are not found in the picnic portal but are already in the ackermans database.

 */