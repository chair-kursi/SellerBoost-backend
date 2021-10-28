const mongoose = require("mongoose");

const StyleTrafficSchema = mongoose.Schema({
    clientId: {
        type: String, 
    },
    styleCode: {
        type: String,
        required: true
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

StyleTrafficSchema.index({clientId: 1, styleCode: 1}, {unique: true});
module.exports = mongoose.model("styleTraffic", StyleTrafficSchema);


