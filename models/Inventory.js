const mongoose = require("mongoose");

const inventorySchema = mongoose.Schema({
  clientId: {
    type: String,
    default: "StyloBug"
  },
  facility: {
    type: String,
    // required: true,
    // unique: true
  },
  itemTypeName: {
    type: String,
    // required: true
  },
  itemSkuCode: {
    type: String,
    // required: true
  },
  EAN: {
    type: Number,
  },
  UPC: {
    type: Number,
  },
  ISBN: {
    type: Number,
  },
  color: {
    type: String,
  },
  size: {
    type: String,
  },
  brand: {
    type: String,
  },
  categoryName: {
    type: String,
  },
  MRP: {
    type: Number,
  },
  openSale: {
    type: Number,
  },
  inventory: {
    type: Number,
  },
  inventoryBlocked: {
    type: Number,
  },
  badInventory: {
    type: Number,
  },
  putawayPending: {
    type: Number,
  },
  pendingInventoryAssessment: {
    type: Number,
  },
  stockInTransfer: {
    type: Number,
  },
  openPurchase: {
    type: Number,
  },
  enabled: {
    type: String,
  },
  costPrice: {
    type: Number,
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
