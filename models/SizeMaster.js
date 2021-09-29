const mongoose = require("mongoose")

const sizeMasterSchema = mongoose.Schema({
    sizeCode: {
        type: String,
        required: true,
        unique: true
    },
    name:{
        type: String,
        required: true
    },
    order:{
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

module.exports = mongoose.model("sizeMaster", sizeMasterSchema)