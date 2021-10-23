const mongoose = require("mongoose")

const skuMasterSchema = mongoose.Schema({
    clientId: {
        type: String,
    },
    skuCode: {
        type: String,
        required: true,
        // unique: true
    },
    sizeCode: {
        type: String, 
        required: true,
    },
    barCode: {
        type: String,
        // required: true, 
        // unique: true
    },
    styleCode: {
        type: String,
        required: true, 
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

skuMasterSchema.index({clientId: 1, skuCode: 1}, {unique: true});

module.exports = mongoose.model("skuMaster", skuMasterSchema)