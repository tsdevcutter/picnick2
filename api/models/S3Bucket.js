const mongoose = require("mongoose");

const S3BucketSchema = new mongoose.Schema(
  {
    barcode: { type: String, required: true, unique: true },
    ETag: { type: String},
    key: { type: String },
    Key: { type: String },
    Location: { type: String },
    Bucket: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("S3Bucket", S3BucketSchema);