"use strict";

var mongoose = require("mongoose");

var styleSchema = mongoose.Schema({
  clientId: {
    type: String
  },
  styleCode: {
    type: String,
    required: true
  },
  name: {
    type: String // required: true

  },
  type: {
    type: String // required: true

  },
  hasSize: {
    type: Boolean,
    "default": true // required: true

  },
  color: {
    type: String,
    "default": "grey" // required: true

  },
  attributes: {
    type: String // required: true

  },
  status: {
    type: String // required: true

  },
  frontImageUrl: {
    type: String,
    "default": "https://5.imimg.com/data5/CV/FG/MY-34112722/girls-short-dress-500x500.jpg" // required: true

  },
  backImageUrl: {
    type: String,
    "default": "https://m.media-amazon.com/images/I/31WTzMQAndL.jpg" // required: true

  },
  zoomImageUrl: {
    type: String,
    "default": "https://m.media-amazon.com/images/I/71h+V+wDLtL._AC_UX385_.jpg" // required: true

  },
  barCode: {
    type: String,
    "default": "Barcode" // required: true

  },
  created: {
    type: Date,
    "default": Date.now()
  },
  updated: {
    type: Date,
    "default": Date.now()
  }
});
styleSchema.index({
  clientId: 1,
  styleCode: 1
}, {
  unique: true
});
module.exports = mongoose.model("style", styleSchema);