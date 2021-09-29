const mongoose = require("mongoose")

const styleSchema = mongoose.Schema({ 
    clientId:{
        type:String,
        default:"StyloBug"
    },
    styleCode: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    hasSize: {
        type: Boolean,
        required: true
    },
    color: {
        type: String,
        required: true
    }, 
    frontImageUrl: {
        type: String,
        required: true
    },
    backImageUrl: {
        type: String,
        required: true
    },
    zoomImageUrl: {
        type: String,
        required: true
    }, 
    barCode: {
        type: String,
        required: true
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

module.exports = mongoose.model("style", styleSchema)