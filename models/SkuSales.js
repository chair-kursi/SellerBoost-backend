const mongoose = require("mongoose");

const SkuSalesSchema = mongoose.Schema({
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
});

module.exports = mongoose.model("SkuSales", SkuSalesSchema);
