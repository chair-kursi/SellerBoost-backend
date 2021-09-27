const mongoose = require("mongoose");

const SkuSalesSchema = mongoose.Schema({
  clientId: {
    type: String,
    default: "StyloBug"
  },
  SkuCode: {
    type: String,
    // required: true,
    // unique: true
  },
  Name: {
    type: String,
    // required: true,
    // unique: true
  },
  TotalSales: {
    type: Number,
    // required: true,
    // unique: true
  },
  DayOfInventory: {
    type: Number,
    // required: true,
    // unique: true
  },
  created: {
    type: Date,
    default: Date.now()
  },
  updated: {
    type: Date,
    default: Date.now()
  }
});

module.exports = mongoose.model("SkuSales", SkuSalesSchema);
