const mongoose = require("mongoose");

const ServiceSchema = mongoose.Schema({
    clientId: {
        type: String,
        default: "StyloBug"
    },
    styleCode: {
        type: String,
        // required: true,
        // unique: true
    },
    trafficActual: {
        type: String,
        // required: true,
        // unique: true
    },
    trafficVirtual: {
        type: String,
        // required: true,
        // unique: true
    },
    currentInv: {
        type: Number,
        // required: true,
        // unique: true
    },
    salesNumber: {
        type: Number,
        // required: true,
        // unique: true
    },
    salesRank: {
        type: Number,
        // required: true,
        // unique: true
    },
    replenishmentRank: {
        type: Number,
        // required: true,
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
});

module.exports = mongoose.model("service", ServiceSchema);
