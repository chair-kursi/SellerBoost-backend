const mongoose = require("mongoose")

const gobalSizeSchema = mongoose.Schema({
    // styleCode: {
    //     type: String,
    //     required: true,
    //     unique: true
    // },
    // rank: {
    //     type: Number,
    //     required: true
    // },
    // totalInv: {
    //     type: Number,
    //     required: true
    // },
    // styloBug: {
    //     type: Number,
    //     required: true
    // },
    // myntraAppMp: {
    //     type: Number,
    //     required: true
    // },
    // amazon: {
    //     type: Number,
    //     required: true
    // },
    // flipkart: {
    //     type: Number,
    //     required: true
    // },
    // ajio: {
    //     type: Number,
    //     required: true
    // },
    // snapdeal: {
    //     type: Number,
    //     required: true
    // },
    // nykaaFashion: {
    //     type: Number,
    //     required: true
    // },
    FLIPKART:{
        type: Array,
    },
    MYNTRA_B2B:{
        type: Array,
    },
    JABONG_WORLD:{
        type: Array,
    },
    AMAZON_IN:{
        type: Array,
    },
    FYND:{
        type: Array,
    },
    SNAPDEAL:{
        type: Array,
    },
    FIRSTCRY:{
        type: Array,
    },
    MYNTRA_FBM:{
        type: Array,
    },
    AJIO:{
        type: Array,
    },
    FLIPKART_SMART:{
        type: Array,
    },
    CLOUDTAIL_DF:{
        type: Array,
    },
    MEESHO:{
        type: Array,
    },
    FIRSTCRY_MARKET_PLACE:{
        type: Array,
    },
    MYNTRAPPMP:{
        type: Array,
    },
    NYKAA_FASHION:{
        type: Array,
    },
    NYKAA_COM:{
        type: Array,
    },
    CLOUDTAIL_NEW:{
        type: Array,
    },
    AMAZON_FLEX_API:{
        type: Array,
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

module.exports = mongoose.model("marketplaceHealth", gobalSizeSchema);