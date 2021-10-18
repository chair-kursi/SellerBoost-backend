const mongoose = require("mongoose")

const summarySchema = mongoose.Schema({
    clientId: {
        type: String,
        default: "StyloBug",
        required: true
    },
    dashboard: {
        soldout: {
            type: Number,
            required: true
        },
        red: {
            type: Number,
            required: true
        },
        orange: {
            type: Number,
            required: true
        },
        green: {
            type: Number,
            required: true
        },
        overgreen: {
            type: Number,
            required: true
        },
        updated: {
            type: Date,
            required: true
        }
    },
    marketplaceHealth: {
        channels:
        {
            channelCode: {
                type: String,
                required: true
            },
            mismatch: {
                type: Number,
                required: true
            }
        },
        updated: {
            type: Date,
            required: true
        }
    },
    skuError: {
        errorCount: {
            type: Number,
            required: true
        },
        updated: {
            type: Date,
            required: true
        }
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

module.exports = mongoose.model("summary", summarySchema);