const mongoose = require("mongoose")

const skuMasterSchema = mongoose.Schema({
    clientID: {
        type: String,
        default: "StyloBug"
    },
    skuCode: {
        type: String,
        required: true,
        unique: true
    },
    sizeCode: {
        type: String,
        unique: true,
        required: true,
    },
    barCode: {
        type: String,
        required: true, 
        unique: true
    },
    styleCode: {
        type: String,
        required: true,
        unique: true
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

module.exports = mongoose.model("skuMaster", skuMasterSchema)