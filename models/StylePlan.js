const mongoose = require("mongoose")

const styleMasterSchema = mongoose.Schema({
    clientID: {
        type: String
    }, 
    styleCode: {
        type: String, 
    },
    LiveStatus:{
        type: String, 
    },
    StatusCount:{
        type: Number, 
    },
    Size1:{
        type: String, 
    },
    Size50:{
        type: String, 
    },
    TotalSales:{
        type: Number, 
    },
    SalesRank:{
        type: Number, 
    },
    TotalInventory:{
        type: Number, 
    },
    SeasonScore:{
        type: Number, 
    },
    GreenScore:{
        type: Number, 
    },
    UrgencyProduct:{
        type: String, 
    },
    UrgencyScore:{
        type: Number, 
    },
    Season:{
        type: String, 
    },
    Status:{
        type: String, 
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

module.exports = mongoose.model("stylePlan", styleMasterSchema)  

// ClientID
// SKU
// Sales
// Inventory
// virtual_inventory
// OPT
// Created
// Updated