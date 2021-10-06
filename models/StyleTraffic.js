const mongoose = require("mongoose");

const ServiceSchema = mongoose.Schema({
    clientId: {
        type: String,
        default: "StyloBug"
    },
    styleCode: {
        type: String,
        required: true,
        unique: true
    },
    trafficActual: {
        type: String,
        // required: true,
    },
    trafficVirtual: {
        type: String,
        // required: true,
    },
    status: {
        type: String,
        // required: true
    },
    currentInv: {
        type: Number,
        // required: true,
    },
    salesNumber: {
        type: Number,
        // required: true,
    },
    salesRank: {
        type: Number,
        // required: true,
    },
    replenishmentRank: {
        type: Number,
        // required: true,
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

module.exports = mongoose.model("styleTraffic", ServiceSchema);


