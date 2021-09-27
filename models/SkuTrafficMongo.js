const mongoose = require("mongoose")

const skuTrafficSchema = mongoose.Schema({
    clientID: {
        type: String,
        default: "StyloBug"
    },
    SkuCode: {
        type: String,
        // required: true,
        // unique: true
    },
    StyleCode: {
        type: String,
        // unique: true
    },
    SizeCode: {
        type: String,
        // unique: true
    },
    DayOfInventory: {
        type: Number,
        // unique: true
    },
    TotalSales: {
        type: Number,
        // unique: true
    },
    dayInventoryVirtual: {
        type: Number,
        // unique: true
    },
    dayInventory: {
        type: Number,
        // unique: true
    },
    trafficColor: {
        type: String,
        // unique: true
    },
    trafficShortCode: {
        type: String,
        // unique: true
    },
    trafficShortCodeVirtual: {
        type: String,
        // unique: true
    },
    skuTrafficCode: {
        type: String,
        // unique: true
    },
    skuTrafficCodeVirtual: {
        type: String,
        // unique: true
    },
    suggestedInventory1: {
        type: Number,
        // unique: true
    },
    suggestedInventory2: {
        type: Number,
        // unique: true
    },
    suggestedInventory3: {
        type: Number,
        // unique: true
    }, 
    Inventory: {
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