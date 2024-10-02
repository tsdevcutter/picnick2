const mongoose = require("mongoose");

const PictureSchema = new mongoose.Schema(
  {
    barcode: { type: String, required: true, unique: true },
    title: { type: String , required: true},
    imgurl: { type: String , required: true},
    supplierid: { type: String },
    key: { type: String },
    key_wp: { type: String },
    imgLeft: { type: String },
    imgRight: { type: String },
    imgUnpack: { type: String },
    onlineDesc: { type: String },
    description: { type: String },
    brand: { type: String },
    presentation: { type: String },//quantity Type
    size: { type: String }, //quantity
    unit: { type: String },
    cost_price: { type: String },
    price: { type: String },
    stockamt: { type: String },
    category : { type: Array },
    catalogues : {type: Array },
    extra_fields : {type: Array },
    taxonomy : {type: Array },
    ackershow: { type: Boolean, default: true },//if ackermans renders it false then update the lets trade end
    draftmode: {type: Boolean, default: false },
    referral: {type: String, default: "" },
    discontinue: {type: Boolean, default: false },
    medicine: {type: Boolean, default: false },
    schedule: {type: String },
    neutralProductUrl: {type: String },
    scheduleProductsUrl: [
      {
        url: { type: String },
        catalogueid: { type: String } //the url to use in this catalogue
      }
    ],
    storePrice: [
      {
        price: { type: String },
        catalogueid: { type: String } //the price to use in this catalogue
      }
    ],
    cjdSpecial: [
      {
        price: { type: String },
        accountType: { type: String }
      }
    ],
    categoryclass: [
      {
        catalogueid: { type: String },
        catTitle: {type: String }//the category class to use in this catalogue
      }
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Picture", PictureSchema);

//scheduleProductsUrl Temporary field for hiding profile images for schedule products
/*
 * Functional Variables 
 * barcode
 * title
 * imgurl
 * supplierid
 * imgLeft
 * imgUnpack
 * imgRight
 * onlineDesc
 * description
 * schedule
 * discontinue
 * draftmode
 * price
 * unit
 * size
 * catalogues
 * taxonomy
 * 
 * medicine (true/false) All medicine will have a schedule field thats not empty
 * if medicine true and schedule is 3 + then use a neutral image. Check for a catalogue specific image if it exist otherwise use neutral
 * 
 * Non-Functional Variables
 * 
 */