const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema(
  {
    catId : { type: String, required: true, unique: true },
    categoryDescription: { type: String }, 
    categoryReference: { type: String },
    categoryName: { type: String},
    parentCatId: { type: String },  
    parentCategoryReference: { type: String },  
    sub_categories: {type: Array },  
    img_url: {type: String },  
    extra_fields: {type: Array },  
    slayer: {type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", CategorySchema);