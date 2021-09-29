const mongoose = require("mongoose");

const SkuSalesSchema = mongoose.Schema({
  clientId: {
    type: String,
    default: "StyloBug"
  },
  skuCode: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
  },
  inventory: {
    type: Number,
    required: true,
  },
  totalSales: {
    type: Number,
    required: true,
  },
  dayOfInventory: {
    type: Number,
    required: true,
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
