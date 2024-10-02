const mongoose = require("mongoose");

const SuggestionsSchema = new mongoose.Schema(
  {
    searchText: { type: String, required: true},
    searchCount: { type: Number, default :0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Suggestions", SuggestionsSchema);