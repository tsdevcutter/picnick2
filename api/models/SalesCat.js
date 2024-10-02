const mongoose = require("mongoose");

const SalesCatSchema = new mongoose.Schema(
  {
    catId : { type: String, required: true, unique: true },
    categoryDescription: { type: String }, 
    categoryReference: { type: String },
    categoryName: { type: String},
    parentCatId: { type: String },  
    parentcategoryReference: { type: String },  
    sub_categories: {type: Array },  
    extra_fields: {type: Array },  
    slayer: {type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SalesCat", SalesCatSchema);