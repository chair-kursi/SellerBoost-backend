const mongoose = require("mongoose")

const gobalSizeSchema = mongoose.Schema({
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