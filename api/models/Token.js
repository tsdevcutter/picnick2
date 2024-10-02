const mongoose = require("mongoose");

const TokenSchema = new mongoose.Schema(
    {
        token: { type: String, required: true, unique: true },
        catalogueId: { type: mongoose.Schema.Types.ObjectId, ref: "Catalogue" },  
        count: { type: Number, default: 0 },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Token", TokenSchema);