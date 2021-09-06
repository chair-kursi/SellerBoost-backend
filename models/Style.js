const mongoose = require("mongoose")

const styleSchema = mongoose.Schema({
    clientID: {
        type: String
    },
    styleCode: {
        type: String
    },
    name: {
        type: String
    },
    type: {
        type: String
    },
    HasSize: {
        type: String//Ask sir about this
    },
    color: {
        type: String
    },
    mrp: {
        type: String
    },
    frontImgUrl: {
        type: String
    },
    backImgUrl: {
        type: String
    },
    zoomImgUrl: {
        type: String
    },
    status:{
        type: String
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

module.exports = mongoose.model("style", styleSchema)