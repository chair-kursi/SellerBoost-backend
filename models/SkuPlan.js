const mongoose = require("mongoose")

const skuPlanSchema = mongoose.Schema({
    clientID: {
        type: String
    },
    styleCode: {
        type: String
    },
    SizeCode: {
         type: String
    },
    BarCode: {
         type: String
    },
    Sales: {
         type: String
    },
    Total_Inventory: {
         type: String
    },
    DayOfInventory: {
         type: String
    },
    LiveStatus: {
         type: String
    },
    Projection1: {
         type: String
    },
    PlanDay1: {
         type: String
    },
    Projection2: {
         type: String
    },
    PlanDay2: {
         type: String
    },
    Projection3: {
         type: String
    },
    PlanDay3: {
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

// SKU  or skuCode? Ask sir.

module.exports = mongoose.model("skuPlan", skuPlanSchema)