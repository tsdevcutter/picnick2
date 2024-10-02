const mongoose = require("mongoose");

const PipelineSchema = new mongoose.Schema(
  {
    title: { type: String},
    catalogue: { type: String},
    catalogueid: { type: String},
  },
  { timestamps: true }
);

module.exports = mongoose.model("Pipeline", PipelineSchema);