"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _asyncIterator(iterable) { var method; if (typeof Symbol !== "undefined") { if (Symbol.asyncIterator) { method = iterable[Symbol.asyncIterator]; if (method != null) return method.call(iterable); } if (Symbol.iterator) { method = iterable[Symbol.iterator]; if (method != null) return method.call(iterable); } } throw new TypeError("Object is not async iterable"); }

var express = require("express");

var router = express.Router();

var StyleTraffic = require("../models/StyleTraffic");

var SkuSales = require("../models/SkuSales");

var SkuMaster = require('../models/SkuMaster');

var Inventory = require("../models/Inventory");

var SkuTrafficMongo = require("../models/SkuTrafficMongo");

var _require = require("json2csv"),
    Parser = _require.Parser;

var fs = require("fs");

var Style = require("../models/Style");

var Summary = require("../models/Summary");

var https = require('https');

var multer = require("multer");

var csvParser = require("csv-parser");

var Client = require("../models/Client");

var _require2 = require("express-validator"),
    header = _require2.header; //DEFINING CONSTATNTS


var inventoryValues = ["", 0, 10, 15, 50, 80, 150, 200, 300]; //"" at index zero is for completing the table

var dayInventoryValues = [0, 5, 15, 30, 45, 65];
var colorArr = ["SOLDOUT", "RED", "RED", "ORANGE", "GREEN", "OVERGREEN"];
var defaultTrafficColors = ["SOLDOUT", "RED", "ORANGE", "GREEN", "OVERGREEN"];
var styleCodeArr = []; //for storing unique styleCodes

var getTrafficColorArr = function getTrafficColorArr() {
  var trafficColorArr = [];
  trafficColorArr.push(inventoryValues);

  for (var i = 0; i < dayInventoryValues.length; i++) {
    var tempArr = [];
    tempArr.push(dayInventoryValues[i]);

    for (var j = 1; j < inventoryValues.length; j++) {
      tempArr.push(colorArr[i]);
    }

    trafficColorArr.push(tempArr);
  }

  trafficColorArr[2][1] = "SOLDOUT";
  trafficColorArr[2][2] = "SOLDOUT"; // trafficColorArr will look like : https://ibb.co/0h6Rg84

  return trafficColorArr;
};

var giveTrafficColor = function giveTrafficColor(dayInv, inv) {
  var inventory = 1,
      dayInventory = 1;

  for (var i = inventoryValues.length - 1; i > 0; i--) {
    if (inv >= inventoryValues[i]) {
      inventory = i;
      break;
    }
  }

  for (var i = dayInventoryValues.length - 1; i >= 0; i--) {
    if (dayInv >= dayInventoryValues[i]) {
      dayInventory = i + 1;
      break;
    }
  }

  return trafficColorArr[dayInventory][inventory];
};

var getTrafficShortCode = function getTrafficShortCode(color) {
  if (color === "OVERGREEN") return "OG";else return color[0] + color[1];
}; //=-=-=-=-=-=-=-=-=-=-=-=DEFINING CONSTANTS FOR TRAFFIC COLOR DATA POPULATION-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=


var trafficColorArr = getTrafficColorArr(); //-=-=-=-=-=-=-=-=-=-=-=-=DEFINING CONSTANTS FOR TRAFFIC COLOR DATA POPULATION ENDS-=-=-=-=-=-=-=-=-=-=-=-=-=-=
//MAPPING STYLECODES WITH TRAFFIC COLOR ----START

var styleCodes = new Map();

var trafficColorCountUsingStyleCode = function trafficColorCountUsingStyleCode(styleCode, trafficColor) {
  var colorCount = new Map();
  var count = 1;
  colorCount.set(trafficColor, 0);
  if (!styleCodes.get(styleCode)) styleCodes.set(styleCode, colorCount);
  if (styleCodes.get(styleCode).get(trafficColor)) count = styleCodes.get(styleCode).get(trafficColor) + 1;
  styleCodes.get(styleCode).set(trafficColor, count);
}; //MAPPING STYLECODES WITH TRAFFIC COLOR ----END


var storeUniqueStyleCodes = function storeUniqueStyleCodes(styleCode) {
  var check = false;
  check = styleCodeArr.find(function (ele) {
    return ele === styleCode;
  });
  if (!check) styleCodeArr.push(styleCode);
};

var setColorCount = function setColorCount() {
  var allColorCount = new Map();
  styleCodeArr.map(function (styleCode) {
    var colorCount = new Map();

    for (var i = 0; i < defaultTrafficColors.length; i++) {
      if (styleCodes.get(styleCode).get(defaultTrafficColors[i])) colorCount.set(defaultTrafficColors[i], styleCodes.get(styleCode).get(defaultTrafficColors[i]));else colorCount.set(defaultTrafficColors[i], 0);
    }

    allColorCount.set(styleCode, colorCount);
  });
  return allColorCount;
};

var setColorScore = function setColorScore(colorCount) {
  var mapColorScoreWithSyleCode = new Map();
  styleCodeArr.map(function (styleCode) {
    var score = 0,
        cnt = 4;

    for (var i = 0; i < defaultTrafficColors.length; i++) {
      score = score + cnt * colorCount.get(styleCode).get(defaultTrafficColors[i]);
      cnt -= 1;
      if (!cnt) cnt += 1;
    }

    mapColorScoreWithSyleCode.set(styleCode, score);
  });
  return mapColorScoreWithSyleCode;
};

var setColorProduct = function setColorProduct(totalSalesOfStylecode, colorScore) {
  var colorProduct = new Map();
  styleCodeArr.map(function (styleCode) {
    var product = totalSalesOfStylecode.get(styleCode) * colorScore.get(styleCode);
    colorProduct.set(styleCode, product);
  });
  return colorProduct;
};

var setReplenishmentRank = function setReplenishmentRank(colorProduct) {
  var sortedColorPoduct = new Map(_toConsumableArray(colorProduct.entries()).sort(function (a, b) {
    return b[1] - a[1];
  })); //DECREASING ORDER

  var replenishmentRank = new Map();
  var sortedStyleCodes = new Array();
  sortedColorPoduct.forEach(function (value, key) {
    sortedStyleCodes.push(key);
  });
  var rank = 1;

  for (var i = 0; i < sortedStyleCodes.length; i++) {
    var styleCode = sortedStyleCodes[i];

    if (!i) {
      replenishmentRank.set(styleCode, 1);
      continue;
    }

    var prevStyleCode = sortedStyleCodes[i - 1];
    if (sortedColorPoduct.get(styleCode) !== sortedColorPoduct.get(prevStyleCode)) rank += 1;
    replenishmentRank.set(styleCode, rank);
  }

  return replenishmentRank;
};

var setSalesRank = function setSalesRank(totalSalesOfStylecode) {
  var sortedSales = new Map(_toConsumableArray(totalSalesOfStylecode.entries()).sort(function (a, b) {
    return b[1] - a[1];
  }));
  var salesRank = new Map();
  var sortedStyleCodes = new Array();
  sortedSales.forEach(function (value, key) {
    sortedStyleCodes.push(key);
  });
  var rank = 1;

  for (var i = 0; i < sortedStyleCodes.length; i++) {
    var styleCode = sortedStyleCodes[i];

    if (!i) {
      salesRank.set(styleCode, 1);
      continue;
    }

    var prevStyleCode = sortedStyleCodes[i - 1];
    if (sortedSales.get(styleCode) !== sortedSales.get(prevStyleCode)) rank += 1;
    salesRank.set(styleCode, rank);
  }

  return salesRank;
};

var setTrafficColor = function setTrafficColor(colorCount) {
  var trafficColor = new Map();
  styleCodeArr.map(function (styleCode) {
    for (var i = 0; i < defaultTrafficColors.length; i++) {
      var color = defaultTrafficColors[i];

      if (colorCount.get(styleCode).get(color)) {
        trafficColor.set(styleCode, color);
        break;
      }
    }
  });
  return trafficColor;
}; //MULTER


var fileStorageEngine = multer.diskStorage({
  destination: function destination(res, file, cb) {
    cb(null, "./csvFiles");
  },
  filename: function filename(req, file, cb) {
    cb(null, Date.now() + "__" + file.originalname);
  }
}); //INVENTORY OBJ

var createInventoryObj = function createInventoryObj(clientId, data) {
  var obj = {
    clientId: clientId,
    facility: data["Facility"],
    itemTypeName: data["Item Type Name"],
    itemSkuCode: data["Item SkuCode"],
    EAN: parseInt(data["EAN"]) || 0,
    UPC: parseInt(data["UPC"]) || 0,
    ISBN: parseInt(data["ISBN"]) || 0,
    color: data["Color"],
    size: data["Size"],
    brand: data["Brand"],
    categoryName: data["Category Name"],
    MRP: parseFloat(data["MRP"]) || 0,
    openSale: parseInt(data["Open Sale"]) || 0,
    inventory: parseInt(data["Inventory"]) || 0,
    inventoryBlocked: parseInt(data["Inventory Blocked"]) || 0,
    badInventory: parseInt(data["Bad Inventory"]) || 0,
    putawayPending: parseInt(data["Putaway Pending"]) || 0,
    pendingInventoryAssessment: parseInt(data["Pending Inventory Assessment"]) || 0,
    stockInTransfer: parseInt(data["Stock In Transfer"]) || 0,
    openPurchase: parseInt(data["Open Purchase"]) || 0,
    enabled: data["Enabled"],
    costPrice: parseInt(data["Cost Price"]) || 0
  };
  return obj;
};

var createSalesObj = function createSalesObj(clientId, data) {
  var obj = {
    clientId: clientId,
    skuCode: data["Sku Code"],
    name: data["Name"],
    inventory: data["Inventory"],
    totalSales: data["Total Sales"],
    dayOfInventory: data["Day Of Inventory"]
  };
  return obj;
};

var checkForHeaders = function checkForHeaders(defaultHeaders, incomingHeaders) {
  if (defaultHeaders.length !== incomingHeaders.length) return {
    matched: false,
    error: "Columns must be " + defaultHeaders.length + " in length"
  };
  var countOfHeaders = 0;

  for (var i = 0; i < defaultHeaders.length; i++) {
    for (var j = 0; j < incomingHeaders.length; j++) {
      if (defaultHeaders[i] === incomingHeaders[j]) {
        countOfHeaders += 1;
        defaultHeaders[i] = '-1';
        incomingHeaders[j] = '-2';
      }
    }
  }

  var unmatchedHeaders = [];

  for (var i = 0; i < incomingHeaders.length; i++) {
    if (incomingHeaders[i] !== '-2') unmatchedHeaders.push(incomingHeaders[i]);
  }

  if (countOfHeaders === defaultHeaders.length) return {
    matched: true
  };
  console.log("unmatchedHeaders", unmatchedHeaders);
  return {
    matched: false,
    error: unmatchedHeaders.join(", ") + " didn't matched"
  };
};

var upload = multer({
  storage: fileStorageEngine
});

function createReadStream(destination) {
  var readSales;
  return regeneratorRuntime.async(function createReadStream$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          readSales = fs.createReadStream(destination).pipe(csvParser({}));
          return _context.abrupt("return", readSales);

        case 2:
        case "end":
          return _context.stop();
      }
    }
  });
}

function readCsvOfSales(defaultSalesHeaders, destination, clientId) {
  var readSales, err, results, headers, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, _value, row, obj, checkHeaders;

  return regeneratorRuntime.async(function readCsvOfSales$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return regeneratorRuntime.awrap(createReadStream(destination));

        case 2:
          readSales = _context2.sent;
          err = [], results = [];
          headers = [];
          _iteratorNormalCompletion = true;
          _didIteratorError = false;
          _context2.prev = 7;
          _iterator = _asyncIterator(readSales);

        case 9:
          _context2.next = 11;
          return regeneratorRuntime.awrap(_iterator.next());

        case 11:
          _step = _context2.sent;
          _iteratorNormalCompletion = _step.done;
          _context2.next = 15;
          return regeneratorRuntime.awrap(_step.value);

        case 15:
          _value = _context2.sent;

          if (_iteratorNormalCompletion) {
            _context2.next = 24;
            break;
          }

          row = _value;
          obj = createSalesObj(clientId, row);
          results.push(obj);
          if (!headers.length) headers = Object.keys(row);

        case 21:
          _iteratorNormalCompletion = true;
          _context2.next = 9;
          break;

        case 24:
          _context2.next = 30;
          break;

        case 26:
          _context2.prev = 26;
          _context2.t0 = _context2["catch"](7);
          _didIteratorError = true;
          _iteratorError = _context2.t0;

        case 30:
          _context2.prev = 30;
          _context2.prev = 31;

          if (!(!_iteratorNormalCompletion && _iterator["return"] != null)) {
            _context2.next = 35;
            break;
          }

          _context2.next = 35;
          return regeneratorRuntime.awrap(_iterator["return"]());

        case 35:
          _context2.prev = 35;

          if (!_didIteratorError) {
            _context2.next = 38;
            break;
          }

          throw _iteratorError;

        case 38:
          return _context2.finish(35);

        case 39:
          return _context2.finish(30);

        case 40:
          checkHeaders = checkForHeaders(defaultSalesHeaders, headers);

          if (!checkHeaders.matched) {
            err.push({
              Source: "Sales",
              Row: "NA",
              Data: "NA",
              Error: checkHeaders.error
            });
          } // console.log(results);


          return _context2.abrupt("return", {
            error: err,
            result: results
          });

        case 43:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[7, 26, 30, 40], [31,, 35, 39]]);
}

function readCsvOfInventory(defaultSalesHeaders, destination, clientId) {
  var readSales, err, results, headers, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, _value2, row, obj, checkHeaders;

  return regeneratorRuntime.async(function readCsvOfInventory$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.next = 2;
          return regeneratorRuntime.awrap(createReadStream(destination));

        case 2:
          readSales = _context3.sent;
          err = [], results = [];
          headers = [];
          _iteratorNormalCompletion2 = true;
          _didIteratorError2 = false;
          _context3.prev = 7;
          _iterator2 = _asyncIterator(readSales);

        case 9:
          _context3.next = 11;
          return regeneratorRuntime.awrap(_iterator2.next());

        case 11:
          _step2 = _context3.sent;
          _iteratorNormalCompletion2 = _step2.done;
          _context3.next = 15;
          return regeneratorRuntime.awrap(_step2.value);

        case 15:
          _value2 = _context3.sent;

          if (_iteratorNormalCompletion2) {
            _context3.next = 24;
            break;
          }

          row = _value2;
          obj = createInventoryObj(clientId, row);
          if (!headers.length) headers = Object.keys(row);
          results.push(obj);

        case 21:
          _iteratorNormalCompletion2 = true;
          _context3.next = 9;
          break;

        case 24:
          _context3.next = 30;
          break;

        case 26:
          _context3.prev = 26;
          _context3.t0 = _context3["catch"](7);
          _didIteratorError2 = true;
          _iteratorError2 = _context3.t0;

        case 30:
          _context3.prev = 30;
          _context3.prev = 31;

          if (!(!_iteratorNormalCompletion2 && _iterator2["return"] != null)) {
            _context3.next = 35;
            break;
          }

          _context3.next = 35;
          return regeneratorRuntime.awrap(_iterator2["return"]());

        case 35:
          _context3.prev = 35;

          if (!_didIteratorError2) {
            _context3.next = 38;
            break;
          }

          throw _iteratorError2;

        case 38:
          return _context3.finish(35);

        case 39:
          return _context3.finish(30);

        case 40:
          checkHeaders = checkForHeaders(defaultSalesHeaders, headers);

          if (!checkHeaders.matched) {
            err.push({
              Source: "Inventory",
              Row: "NA",
              Data: "NA",
              Error: checkHeaders.error
            });
          } // console.log(results);


          return _context3.abrupt("return", {
            error: err,
            result: results
          });

        case 43:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[7, 26, 30, 40], [31,, 35, 39]]);
}

router.post("/dashboardUploads", upload.fields([{
  name: 'skuSales',
  maxCount: 1
}, {
  name: 'skuInventory',
  maxCount: 1
}]), function _callee3(req, res) {
  var localId, client, clientId, error, err, resultsobj, OBJ, defaultSalesHeaders, defaultInventoryHeaders, file, results, headerErr, result, _results, download, _file, _results2, _headerErr, _result2, _results3;

  return regeneratorRuntime.async(function _callee3$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          _context6.prev = 0;
          localId = req.cookies.LocalId;
          _context6.next = 4;
          return regeneratorRuntime.awrap(Client.findOne({
            password: localId
          }));

        case 4:
          client = _context6.sent;
          clientId = client.clientId; // TO DELETE THIS

          _context6.next = 8;
          return regeneratorRuntime.awrap(SkuSales.deleteMany({
            clientId: clientId
          }));

        case 8:
          _context6.next = 10;
          return regeneratorRuntime.awrap(Inventory.deleteMany({
            clientId: clientId
          }));

        case 10:
          error = [];
          err = [];
          resultsobj = {};
          defaultSalesHeaders = ['Sku Code', 'Name', 'Total Sales', 'Day Of Inventory', 'Inventory'];
          defaultInventoryHeaders = ['Facility', 'Item Type Name', 'Item SkuCode', 'EAN', 'UPC', 'IJBN', 'Color', 'Size', 'Brand', 'Category Name', 'MRP', 'Open Sale', 'Inventory', 'Inventory Blocked', 'Bad Inventory', 'Putaway Pending', 'Pending Inventory Assessment', 'Stock In Transfer', 'Open Purchase', 'Enabled', 'Cost Price'];

          if (!(req.files && req.files.skuSales && req.files.skuSales.length && req.files.skuSales[0].path)) {
            _context6.next = 36;
            break;
          }

          _context6.prev = 16;
          _context6.next = 19;
          return regeneratorRuntime.awrap(readCsvOfSales(defaultSalesHeaders, req.files.skuSales[0].path, clientId).then(function (e) {
            return e;
          }));

        case 19:
          file = _context6.sent;
          results = file.result;
          headerErr = file.error;
          err.push.apply(err, _toConsumableArray(headerErr));

          if (headerErr.length) {
            _context6.next = 28;
            break;
          }

          _context6.next = 26;
          return regeneratorRuntime.awrap(SkuSales.insertMany(results));

        case 26:
          result = _context6.sent;
          resultsobj = _objectSpread({}, resultsobj, {
            skuSales: result
          });

        case 28:
          _context6.next = 34;
          break;

        case 30:
          _context6.prev = 30;
          _context6.t0 = _context6["catch"](16);
          console.log("error", _context6.t0);
          error.push({
            message: _context6.t0
          });

        case 34:
          _context6.next = 37;
          break;

        case 36:
          if (req.body.salesUrl) {
            _results = [];

            download = function download(url, dest) {
              var file = fs.createWriteStream(dest);
              https.get(url, function (response) {
                response.pipe(file);
                file.on('finish', function () {
                  fs.createReadStream(dest).pipe(csvParser({})).on('headers', function (headers) {
                    if (!checkForHeaders(defaultSalesHeaders, headers)) res.json({
                      data: null,
                      error: "Headers didn't matched"
                    });
                  }).on("data", function (data) {
                    var obj = createSalesObj(clientId, data);

                    _results.push(obj);
                  }).on("end", function _callee() {
                    var _result;

                    return regeneratorRuntime.async(function _callee$(_context4) {
                      while (1) {
                        switch (_context4.prev = _context4.next) {
                          case 0:
                            _context4.prev = 0;
                            _context4.next = 3;
                            return regeneratorRuntime.awrap(SkuSales.insertMany(_results));

                          case 3:
                            _result = _context4.sent;
                            resultsobj = _objectSpread({}, resultsobj, {
                              skuSales: _result
                            }); // console.log("Resp of saving skuSales in DB", result);

                            fs.unlink(dest, function (err) {
                              //deleting created file
                              if (err) throw err;
                              console.log("deleted");
                            });
                            _context4.next = 11;
                            break;

                          case 8:
                            _context4.prev = 8;
                            _context4.t0 = _context4["catch"](0);
                            error.push({
                              message: _context4.t0
                            });

                          case 11:
                          case "end":
                            return _context4.stop();
                        }
                      }
                    }, null, null, [[0, 8]]);
                  });
                });
              });
            };

            download(req.body.fileUrl, "csvFiles/SKUSALES" + Date.now());
          } else err.push({
            Source: "skuSales",
            Row: "NA",
            Data: "NA",
            error: "Not Found"
          });

        case 37:
          if (!(req.files && req.files.skuInventory && req.files.skuInventory.length && req.files.skuInventory[0].path)) {
            _context6.next = 57;
            break;
          }

          _context6.prev = 38;
          _context6.next = 41;
          return regeneratorRuntime.awrap(readCsvOfInventory(defaultInventoryHeaders, req.files.skuInventory[0].path, clientId).then(function (e) {
            return e;
          }));

        case 41:
          _file = _context6.sent;
          _results2 = _file.result;
          _headerErr = _file.error;
          err.push.apply(err, _toConsumableArray(_headerErr));

          if (_headerErr.length) {
            _context6.next = 50;
            break;
          }

          _context6.next = 48;
          return regeneratorRuntime.awrap(Inventory.insertMany(_results2));

        case 48:
          _result2 = _context6.sent;
          resultsobj = _objectSpread({}, resultsobj, {
            inventory: _result2
          });

        case 50:
          _context6.next = 55;
          break;

        case 52:
          _context6.prev = 52;
          _context6.t1 = _context6["catch"](38);
          res.json({
            message: _context6.t1
          });

        case 55:
          _context6.next = 58;
          break;

        case 57:
          if (req.body.inventoryUrl) {
            _results3 = [];

            download = function download(url, dest) {
              var file = fs.createWriteStream(dest);
              https.get(url, function (response) {
                response.pipe(file);
                file.on('finish', function () {
                  fs.createReadStream(dest).pipe(csvParser({})).on('headers', function (headers) {
                    if (!checkForHeaders(defaultInventoryHeaders, headers)) res.json({
                      data: null,
                      error: "Headers didn't matched"
                    });
                  }).on("data", function (data) {
                    var obj = createInventoryObj(clientId, data);

                    _results3.push(obj);
                  }).on("end", function _callee2() {
                    var _result3;

                    return regeneratorRuntime.async(function _callee2$(_context5) {
                      while (1) {
                        switch (_context5.prev = _context5.next) {
                          case 0:
                            _context5.prev = 0;
                            _context5.next = 3;
                            return regeneratorRuntime.awrap(Inventory.insertMany(_results3));

                          case 3:
                            _result3 = _context5.sent;
                            resultsobj = _objectSpread({}, resultsobj, {
                              inventory: _result3
                            });
                            _context5.next = 10;
                            break;

                          case 7:
                            _context5.prev = 7;
                            _context5.t0 = _context5["catch"](0);
                            error.push({
                              message: _context5.t0
                            });

                          case 10:
                          case "end":
                            return _context5.stop();
                        }
                      }
                    }, null, null, [[0, 7]]);
                  });
                });
              });
            };

            download(req.body.fileUrl, "csvFiles/INVENTORY" + Date.now());
          } else err.push({
            Source: "Inventory",
            Row: "NA",
            Data: "NA",
            error: "Not Found"
          });

        case 58:
          // console.log("err", err);
          if (err.length) {
            exportCsv(res, err);
          } else {
            styleTraffic(req, res, clientId, resultsobj).then(function (dashboard) {
              res.json(dashboard);
            });
          }

          _context6.next = 64;
          break;

        case 61:
          _context6.prev = 61;
          _context6.t2 = _context6["catch"](0);
          res.status(400).json({
            message1: _context6.t2
          });

        case 64:
        case "end":
          return _context6.stop();
      }
    }
  }, null, null, [[0, 61], [16, 30], [38, 52]]);
});

var styleTraffic = function styleTraffic(req, res, clientId, resultsobj) {
  var i, itemMaster, _ret;

  return regeneratorRuntime.async(function styleTraffic$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          _context8.prev = 0;
          _context8.next = 3;
          return regeneratorRuntime.awrap(function _callee4() {
            var allSkus, allSkuSales, allSkuInventory, styleMaster, skuSalesMap, skuInvMap, skuSalesData, skuInventoryData, totalInventoryOfStylecode, totalSalesOfStylecode, _i, _skuSalesData, _skuInventoryData, TotalSales, DayOfInventory, inventory, styleCode, skuCode, sizeCode, prevInventory, prevSales, dayInventory, _trafficColor, trafficShortCode, skuTrafficCode, planDay1, planDay2, planDay3, suggestedInventory1, suggestedInventory2, suggestedInventory3, suggestedSmoothInventory1, suggestedSmoothInventory2, suggestedSmoothInventory3, skuData, Item, colorCount, colorScore, colorProduct, replenishmentRank, salesRank, trafficColor, finalArray, statusArr, summaryObj, _loop, _i2, summary, dashboard, summaryRes;

            return regeneratorRuntime.async(function _callee4$(_context7) {
              while (1) {
                switch (_context7.prev = _context7.next) {
                  case 0:
                    _context7.next = 2;
                    return regeneratorRuntime.awrap(SkuTrafficMongo.deleteMany({
                      clientId: clientId
                    }));

                  case 2:
                    _context7.next = 4;
                    return regeneratorRuntime.awrap(StyleTraffic.deleteMany({
                      clientId: clientId
                    }));

                  case 4:
                    _context7.next = 6;
                    return regeneratorRuntime.awrap(SkuMaster.find({
                      clientId: clientId
                    }));

                  case 6:
                    allSkus = _context7.sent;
                    _context7.next = 9;
                    return regeneratorRuntime.awrap(SkuSales.find({
                      clientId: clientId
                    }));

                  case 9:
                    allSkuSales = _context7.sent;
                    _context7.next = 12;
                    return regeneratorRuntime.awrap(Inventory.find({
                      clientId: clientId
                    }));

                  case 12:
                    allSkuInventory = _context7.sent;
                    _context7.next = 15;
                    return regeneratorRuntime.awrap(Style.find({
                      clientId: clientId
                    }));

                  case 15:
                    styleMaster = _context7.sent;
                    skuSalesMap = new Map();
                    skuInvMap = new Map();

                    for (i = 0; i < allSkus.length; i++) {
                      skuSalesData = allSkuSales.find(function (ele) {
                        return ele.skuCode === allSkus[i].skuCode;
                      });
                      skuInventoryData = allSkuInventory.find(function (ele) {
                        return ele.itemSkuCode === allSkus[i].skuCode;
                      });
                      skuSalesMap.set(allSkus[i].skuCode, skuSalesData);
                      skuInvMap.set(allSkus[i].skuCode, skuInventoryData);
                    }

                    itemMaster = [];
                    totalInventoryOfStylecode = new Map();
                    totalSalesOfStylecode = new Map();

                    for (_i = 0; _i < allSkus.length; _i++) {
                      _skuSalesData = skuSalesMap.get(allSkus[_i].skuCode);
                      _skuInventoryData = skuInvMap.get(allSkus[_i].skuCode);
                      TotalSales = 0, DayOfInventory = 0, inventory = 0, styleCode = allSkus[_i].styleCode, skuCode = allSkus[_i].skuCode, sizeCode = allSkus[_i].sizeCode; //STORING UNIQUE STYLECODES -----START

                      storeUniqueStyleCodes(styleCode); //STORING UNIQUE STYLECODES -----END

                      if (_skuInventoryData && _skuInventoryData.inventory) inventory = _skuInventoryData.inventory;
                      if (_skuSalesData && _skuSalesData.totalSales) TotalSales = _skuSalesData.totalSales;
                      if (_skuSalesData && _skuSalesData.dayOfInventory) DayOfInventory = _skuSalesData.dayOfInventory;
                      prevInventory = totalInventoryOfStylecode.get(styleCode);
                      prevSales = totalSalesOfStylecode.get(styleCode);
                      if (!prevInventory) totalInventoryOfStylecode.set(styleCode, inventory);else totalInventoryOfStylecode.set(styleCode, prevInventory + inventory);
                      if (!prevSales) totalSalesOfStylecode.set(styleCode, TotalSales);else totalSalesOfStylecode.set(styleCode, prevSales + TotalSales);
                      dayInventory = 0;
                      if (TotalSales) dayInventory = Math.round(inventory * 30 / TotalSales);else dayInventory = Math.round(inventory * 30 / 0.2);
                      _trafficColor = giveTrafficColor(dayInventory, inventory);
                      trafficShortCode = getTrafficShortCode(_trafficColor);
                      skuTrafficCode = trafficShortCode + "_" + dayInventory + "D_" + inventory + "C_" + TotalSales + "S#";
                      planDay1 = 30, planDay2 = 60, planDay3 = 90;
                      suggestedInventory1 = planDay1 / 30 * TotalSales - inventory > 0 ? planDay1 / 30 * TotalSales - inventory : 0; //suggestedInventory1 = (planDay1 / 30) * TotalSales - inventory

                      suggestedInventory2 = planDay2 / 30 * TotalSales - inventory > 0 ? planDay2 / 30 * TotalSales - inventory : 0; //suggestedInventory2 = (planDay2 / 30) * TotalSales - inventory

                      suggestedInventory3 = planDay3 / 30 * TotalSales - inventory > 0 ? planDay3 / 30 * TotalSales - inventory : 0; //suggestedInventory3 = (planDay3 / 30) * TotalSales - inventory

                      suggestedSmoothInventory1 = void 0, suggestedSmoothInventory2 = void 0, suggestedSmoothInventory3 = void 0;
                      if (suggestedInventory1 < 100) suggestedSmoothInventory1 = Math.round(suggestedInventory1 / 10) * 10;else suggestedSmoothInventory1 = Math.round(suggestedInventory1 / 100) * 100;
                      if (suggestedInventory2 < 100) suggestedSmoothInventory2 = Math.round(suggestedInventory2 / 10) * 10;else suggestedSmoothInventory2 = Math.round(suggestedInventory2 / 100) * 100;
                      if (suggestedInventory3 < 100) suggestedSmoothInventory3 = Math.round(suggestedInventory3 / 10) * 10;else suggestedSmoothInventory3 = Math.round(suggestedInventory3 / 100) * 100; //MAPPING STYLECODES WITH TRAFFIC COLOR ----START

                      trafficColorCountUsingStyleCode(styleCode, _trafficColor);
                      skuData = {
                        clientId: clientId,
                        skuCode: skuCode,
                        styleCode: styleCode,
                        sizeCode: sizeCode,
                        totalSales: TotalSales,
                        dayOfInventory: DayOfInventory,
                        inventory: inventory,
                        inventoryVirtual: inventory,
                        dayInventory: dayInventory,
                        dayInventoryVirtual: dayInventory,
                        trafficColor: _trafficColor,
                        trafficShortCode: trafficShortCode,
                        trafficShortCodeVirtual: trafficShortCode,
                        skuTrafficCode: skuTrafficCode,
                        skuTrafficCodeVirtual: skuTrafficCode,
                        suggestedInventory1: suggestedInventory1,
                        suggestedSmoothInventory1: suggestedSmoothInventory1,
                        suggestedInventory2: suggestedInventory2,
                        suggestedSmoothInventory2: suggestedSmoothInventory2,
                        suggestedInventory3: suggestedInventory3,
                        suggestedSmoothInventory3: suggestedSmoothInventory3
                      };
                      itemMaster.push(skuData);
                    }

                    _context7.next = 25;
                    return regeneratorRuntime.awrap(SkuTrafficMongo.insertMany(itemMaster));

                  case 25:
                    Item = _context7.sent;
                    //SETTING TRAFFIC COLORS COUNT 
                    colorCount = setColorCount();
                    colorScore = setColorScore(colorCount);
                    colorProduct = setColorProduct(totalSalesOfStylecode, colorScore);
                    replenishmentRank = setReplenishmentRank(colorProduct);
                    salesRank = setSalesRank(totalSalesOfStylecode);
                    trafficColor = setTrafficColor(colorCount);
                    finalArray = [];
                    statusArr = ["Launching", "Live", "Disabled"];
                    summaryObj = {};

                    _loop = function _loop(_i2) {
                      var styleCode = styleCodeArr[_i2],
                          currentInv = totalInventoryOfStylecode.get(styleCode),
                          salesNumber = totalSalesOfStylecode.get(styleCode),
                          status = styleMaster.find(function (ele) {
                        return ele.styleCode === styleCode;
                      }).status;

                      if (status === null) {
                        status = statusArr[Math.floor(Math.random() * 3)];
                      }

                      var obj = {
                        clientId: clientId,
                        styleCode: styleCode,
                        trafficActual: trafficColor.get(styleCode),
                        trafficVirtual: trafficColor.get(styleCode),
                        status: status,
                        currentInv: currentInv,
                        salesNumber: salesNumber,
                        salesRank: salesRank.get(styleCode),
                        replenishmentRank: replenishmentRank.get(styleCode)
                      };
                      if (!summaryObj[obj.trafficActual]) summaryObj[obj.trafficActual] = 0;
                      summaryObj[obj.trafficActual] += 1; //CHECK WHY IT'S NOT WORKING
                      // console.log(obj);

                      finalArray.push(obj);
                    };

                    for (_i2 = 0; _i2 < styleCodeArr.length; _i2++) {
                      _loop(_i2);
                    }

                    finalArray.sort(function (a, b) {
                      return a.salesRank - b.salesRank;
                    });
                    summary = {
                      soldout: summaryObj["SOLDOUT"] || 0,
                      red: summaryObj["RED"] || 0,
                      orange: summaryObj["ORANGE"] || 0,
                      green: summaryObj["GREEN"] || 0,
                      overgreen: summaryObj["OVERGREEN"] || 0,
                      updated: Date.now()
                    };
                    _context7.next = 41;
                    return regeneratorRuntime.awrap(StyleTraffic.insertMany(finalArray));

                  case 41:
                    dashboard = _context7.sent;
                    _context7.next = 44;
                    return regeneratorRuntime.awrap(Summary.updateOne({
                      clientId: clientId
                    }, {
                      dashboard: summary
                    }, {
                      "new": true
                    }));

                  case 44:
                    summaryRes = _context7.sent;
                    return _context7.abrupt("return", {
                      v: {
                        data: dashboard,
                        summary: summaryRes,
                        resultsobj: resultsobj,
                        error: null
                      }
                    });

                  case 46:
                  case "end":
                    return _context7.stop();
                }
              }
            });
          }());

        case 3:
          _ret = _context8.sent;

          if (!(_typeof(_ret) === "object")) {
            _context8.next = 6;
            break;
          }

          return _context8.abrupt("return", _ret.v);

        case 6:
          _context8.next = 11;
          break;

        case 8:
          _context8.prev = 8;
          _context8.t0 = _context8["catch"](0);
          res.status(400).json({
            message: _context8.t0
          });

        case 11:
        case "end":
          return _context8.stop();
      }
    }
  }, null, null, [[0, 8]]);
};

router.get("/styleTraffic", function _callee5(req, res) {
  var localId, client, _clientId, dashBoard;

  return regeneratorRuntime.async(function _callee5$(_context9) {
    while (1) {
      switch (_context9.prev = _context9.next) {
        case 0:
          _context9.prev = 0;
          localId = req.cookies.LocalId; // if(!localId)
          // localId="6N9yuxkxf6MhmSdOZuvAuze3l943"; 

          _context9.next = 4;
          return regeneratorRuntime.awrap(Client.findOne({
            password: localId
          }));

        case 4:
          client = _context9.sent;
          _clientId = client.clientId;
          _context9.next = 8;
          return regeneratorRuntime.awrap(StyleTraffic.find({
            clientId: _clientId
          }));

        case 8:
          dashBoard = _context9.sent;
          res.json({
            data: dashBoard,
            error: null
          });
          _context9.next = 15;
          break;

        case 12:
          _context9.prev = 12;
          _context9.t0 = _context9["catch"](0);
          res.json({
            data: null,
            error: _context9.t0
          });

        case 15:
        case "end":
          return _context9.stop();
      }
    }
  }, null, null, [[0, 12]]);
});

var exportCsv = function exportCsv(res, json) {
  console.log("json", json);
  var fields = ["Source", "Row", "Data", "Error"];
  var opts = {
    fields: fields
  };

  try {
    var parser = new Parser(opts);
    var csv = parser.parse(json);
    var destination = "csvFiles/Sales&InventoryError" + Date.now() + ".csv";
    fs.writeFile(destination, csv, function (err) {
      if (err) throw err;
      res.set('Content-Type', 'application/csv');
      res.download(destination);
    });
  } catch (err) {
    console.error(err);
  }
};

module.exports = router;