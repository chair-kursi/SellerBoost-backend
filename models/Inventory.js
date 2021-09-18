const mongoose = require("mongoose")

const inventorySchema = mongoose.Schema({ 
    StyleCode: {
        type: String,
        // required: true,
        unique: true
    },
    TrafficActual:{
        type: String,
        // required: true
    },
    CurrentInv:{
        type: Number,
        // required: true
    },
    SalesNumber: {
        type: Number,
    },
    SalesRank: {
        type: Number,
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

module.exports = mongoose.model("inventory", inventorySchema)