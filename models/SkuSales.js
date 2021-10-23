const mongoose = require("mongoose");

const SkuSalesSchema = mongoose.Schema({
  clientId: {
    type: String,
  },
  skuCode: {
    type: String,
    required: true, 
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
SkuSalesSchema.index({clientId: 1, skuCode: 1}, {unique: true});

module.exports = mongoose.model("SkuSales", SkuSalesSchema);
