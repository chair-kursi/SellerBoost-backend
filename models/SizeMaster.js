const mongoose = require("mongoose")

const sizeMasterSchema = mongoose.Schema({
    clientId:{
        type: String
    },
    sizeCode: {
        type: String,
        required: true, 
    },
    name:{
        type: String,
        // required: true
    },
    order:{
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

sizeMasterSchema.index({clientId: 1, styleCode: 1}, {unique: true});
module.exports = mongoose.model("sizeMaster", sizeMasterSchema)