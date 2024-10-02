const mongoose = require("mongoose");

const BroadsheetSchema = new mongoose.Schema(
  {
    stockcode: { type: String},
    barcode: { type: String},
    title: { type: String},
    price: { type: String},
    qty: { type: String},
    promotion: { type: String},
    digit: { type: String},
    schedule: { type: String},
    reform: {
        count: { type: Number, default: 0},
        update: { type: Date}
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Broadsheet", BroadsheetSchema);

//reform
//Everytime this product is found from the ackerman's list, increment the count