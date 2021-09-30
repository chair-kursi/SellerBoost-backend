const mongoose = require("mongoose");

const inventorySchema = mongoose.Schema({
  clientId: {
    type: String,
    default: "StyloBug"
  },
  facility: {
    type: String,
    // required: true  
  },
  itemTypeName: {
    type: String,
    // required: true 
  },
  itemSkuCode: {
    type: String,
    required: true,
    unique: true
  },
  EAN: {
    type: String,
    // required: true
  },
  UPC: {
    type: String,
    // required: true
  },
  ISBN: {
    type: String,
    // required: true
  },
  color: {
    type: String,
    // required: true
  },
  size: {
    type: String,
    // required: true
  },
  brand: {
    type: String,
    // required: true
  },
  categoryName: {
    type: String,
    // required: true
  },
  MRP: {
    type: String,
    // required: true
  },
  openSale: {
    type: Number,
    // required: true
  },
  inventory: {
    type: Number,
    required: true
  },
  inventoryBlocked: {
    type: Number,
    // required: true
  },
  badInventory: {
    type: Number,
    // required: true
  },
  putawayPending: {
    type: Number,
    // required: true
  },
  pendingInventoryAssessment: {
    type: Number,
    // required: true
  },
  stockInTransfer: {
    type: Number,
    // required: true
  },
  openPurchase: {
    type: Number,
    // required: true
  },
  enabled: {
    type: String,
    // required: true
  },
  costPrice: {
    type: String,
    // required: true
  },
  created: {
    type: Date,
    default: Date.now,
  },
  updated: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("inventory", inventorySchema);
