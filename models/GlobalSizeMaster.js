const mongoose = require("mongoose")

const gobalSizeSchema = mongoose.Schema({
    sizeCode: {
        type: String,
        // required: true
    },
    sizeName: {
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

module.exports = mongoose.model("globalSize", gobalSizeSchema)