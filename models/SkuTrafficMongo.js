const mongoose = require("mongoose")

const skuTrafficSchema = mongoose.Schema({
    clientID: {
        type: String,
        default: "StyloBug"
    },
    skuCode: {
        type: String,
        // required: true,
        // unique: true
    },
    styleCode: {
        type: String,
        // unique: true
    },
    sizeCode: {
        type: String,
        // unique: true
    },
    day_Inventory: {
        type: String,
        // unique: true
    },
    sales: {
        type: Number,
        // unique: true
    },
    inventory: {
        type: Number,
        // unique: true
    },
    created: {
        type: Date,
        default: Date.now()
    },
    updated: {
        type: Date,
        default: Date.now()
    }
})

module.exports = mongoose.model("skuTraffic", skuTrafficSchema)