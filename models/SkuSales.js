const mongoose = require("mongoose");

const SkuSalesSchema = mongoose.Schema({
  clientId: {
    type: String,
    default: "StyloBug"
  },
  skuCode: {
    type: String,
    // required: true,
    // unique: true
  },
  name: {
    type: String,
    // required: true,
    // unique: true
  },
  inventory: {
    type: Number,
    // required: true,
    // unique: true
  },
  totalSales: {
    type: Number,
    // required: true,
    // unique: true
  },
  dayOfInventory: {
    type: Number,
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
