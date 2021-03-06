const mongoose = require("mongoose")

const skuTrafficSchema = mongoose.Schema({
    clientId: {
        type: String, 
    },
    skuCode: {
        type: String,
        required: true, 
    },
    styleCode: {
        type: String,
        required: true,
        // unique: true
    },
    sizeCode: {
        type: String,
        required: true,
        // unique: true
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
    suggestedSmoothInventory1:{
        type: Number,
        required: true
    },
    suggestedInventory2: {
        type: Number,
        required: true
    },
    suggestedSmoothInventory2:{
        type: Number,
        required: true
    },
    suggestedInventory3: {
        type: Number,
        required: true
    }, 
    suggestedSmoothInventory3:{
        type: Number,
        required: true
    },
    inventory: {
        type: Number,
        required: true
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

skuTrafficSchema.index({clientId: 1, skuCode: 1}, {unique: true});
module.exports = mongoose.model("skuTraffic", skuTrafficSchema)