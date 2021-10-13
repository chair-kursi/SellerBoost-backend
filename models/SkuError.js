const mongoose = require("mongoose")

const skuErrorSchema = mongoose.Schema({
    clientId: {
        type:String,
        default: "StyloBug",
        required: true
    },
    skuCode: {
        type: String,
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

module.exports = mongoose.model("skuError", skuErrorSchema)