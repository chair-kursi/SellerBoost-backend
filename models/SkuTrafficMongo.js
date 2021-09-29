const mongoose = require("mongoose")

const skuTrafficSchema = mongoose.Schema({
    clientID: {
        type: String,
        default: "StyloBug"
    },
    skuCode: {
        type: String,
        required: true,
        unique: true
    },
    styleCode: {
        type: String,
        required: true,
        unique: true
    },
    sizeCode: {
        type: String,
        required: true,
        unique: true
    },
    dayOfInventory: {
        type: Number,
        required: true
    },
    totalSales: {
        type: Number,
        required: true
    },
    dayInventoryVirtual: {
        type: Number,
        required: true
    },
    dayInventory: {
        type: Number,
        required: true
    },
    trafficColor: {
        type: String,
        required: true
    },
    trafficShortCode: {
        type: String,
        required: true
    },
    trafficShortCodeVirtual: {
        type: String,
        required: true
    },
    skuTrafficCode: {
        type: String,
        required: true
    },
    skuTrafficCodeVirtual: {
        type: String,
        required: true
    },
    suggestedInventory1: {
        type: Number,
        required: true
    },
    suggestedInventory2: {
        type: Number,
        required: true
    },
    suggestedInventory3: {
        type: Number,
        required: true
    }, 
    Inventory: {
        type: Number,
        required: true
    },
    created: {
        type: Date,
        required: true,
        default: Date.now()
    },
    updated: {
        type: Date,
        required: true,
        default: Date.now()
    }
})

module.exports = mongoose.model("skuTraffic", skuTrafficSchema)