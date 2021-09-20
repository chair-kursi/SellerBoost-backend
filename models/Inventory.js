const mongoose = require("mongoose");

const inventorySchema = mongoose.Schema({
  Facility: {
    type: String,
    // required: true,
    // unique: true
  },
  ItemTypeName: {
    type: String,
    // required: true
  },
  ItemSkuCode: {
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
  Color: {
    type: String,
  },
  Size: {
    type: String,
  },
  Brand: {
    type: String,
  },
  CategoryName: {
    type: String,
  },
  MRP: {
    type: Number,
  },
  OpenSale: {
    type: Number,
  },
  Inventory: {
    type: Number,
  },
  InventoryBlocked: {
    type: Number,
  },
  BadInventory: {
    type: Number,
  },
  PutwayPending: {
    type: Number,
  },
  PendingInventoryAssessment: {
    type: Number,
  },
  StockInTransfer: {
    type: Number,
  },
  OpenPurchase: {
    type: Number,
  },
  Enabled: {
    type: Boolean,
  },
  Created: {
    type: Date,
    default: Date.now,
  },
  CostPrice: {
    type: Number,
  },
  updated: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("inventory", inventorySchema);
