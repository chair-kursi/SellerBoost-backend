const mongoose = require("mongoose")

const gobalSizeSchema = mongoose.Schema({
    styleCode: {
        type: String,
        required: true,
        unique: true
    },
    rank: {
        type: Number,
        required: true
    },
    totalInv: {
        type: Number,
        required: true
    },
    styloBug: {
        type: Number,
        required: true
    },
    myntraAppMp: {
        type: Number,
        required: true
    },
    amazon: {
        type: Number,
        required: true
    },
    flipkart: {
        type: Number,
        required: true
    },
    ajio: {
        type: Number,
        required: true
    },
    snapdeal: {
        type: Number,
        required: true
    },
    nykaaFashion: {
        type: Number,
        required: true
    },
    created: {
        type: Date,
        default: Date.now
    },
    updated: {
        type: Date,
        default: Date.now()
    }
})

module.exports = mongoose.model("marketplaceHealth", gobalSizeSchema);