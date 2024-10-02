const mongoose = require("mongoose");

const SupplierSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    information: { type: String },
    userIds: { type: Array },
    supplierUrl: { type: String },
    approvalCode: { type: String },
    slayer: {type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Supplier", SupplierSchema);