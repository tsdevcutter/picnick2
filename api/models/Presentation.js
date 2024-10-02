const mongoose = require("mongoose");

const PresentationSchema = new mongoose.Schema(
  {
    title: { type: String},
    note: { type: String},
  },
  { timestamps: true }
);

module.exports = mongoose.model("Presentation", PresentationSchema);