const mongoose = require("mongoose")

const sizeMasterSchema = mongoose.Schema({
    clientID: {
        type: String
    },
    ClientSizeName: {
        type: String
    },
    ClientSizeCode: {
        type: String
    },
    Visible: {
        type: String
    },
    sizeCode: {
        type: String,
        // required: true
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

module.exports = mongoose.model("sizeMaster", sizeMasterSchema)