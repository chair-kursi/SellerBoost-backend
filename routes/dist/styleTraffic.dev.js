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

var SkuMaster = require("../models/SkuMaster");

var Inventory = require("../models/Inventory");

var SkuTrafficMongo = require("../models/SkuTrafficMongo");

var _require = require("json2csv"),
    Parser = _require.Parser;

var fs = require("fs");

var Style = require("../models/Style");

var Summary = require("../models/Summary");

var https = require("https");

var multer = require("multer");

var csvParser = require("csv-parser");

var Client = require("../models/Client");

var _require2 = require("express-validator"),
    header = _require2.header;

var _require3 = require("../validators/basicValidations"),
    isValidSkuCode = _require3.isValidSkuCode; //DEFINING CONSTATNTS


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
    error: "Columns must be of length " + defaultHeaders.length + " exactly."
  };
  var countOfHeaders = 0;

  for (var i = 0; i < defaultHeaders.length; i++) {
    for (var j = 0; j < incomingHeaders.length; j++) {
      if (defaultHeaders[i] === incomingHeaders[j]) {
        countOfHeaders += 1;
        defaultHeaders[i] = "-1";
        incomingHeaders[j] = "-2";
      }
    }
  }

  var unmatchedHeaders = [];

  for (var i = 0; i < incomingHeaders.length; i++) {
    if (incomingHeaders[i] !== "-2") unmatchedHeaders.push(defaultHeaders[i]);
  }

  if (countOfHeaders === defaultHeaders.length) return {
    matched: true
  }; //   console.log("unmatchedHeaders", unmatchedHeaders);

  return {
    matched: false,
    error: unmatchedHeaders.join(", ") + " didn't Found!!"
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
  var readSales, err, results, inValidSku, headers, rowNum, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _loop, _iterator, _step, _value, isValidSku, checkHeaders;

  return regeneratorRuntime.async(function readCsvOfSales$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return regeneratorRuntime.awrap(createReadStream(destination));

        case 2:
          readSales = _context2.sent;
          err = [], results = [], inValidSku = [];
          headers = [], rowNum = 0;
          _iteratorNormalCompletion = true;
          _didIteratorError = false;
          _context2.prev = 7;

          _loop = function _loop() {
            var row = _value;
            var obj = createSalesObj(clientId, row);
            rowNum++;
            isValidSku = isValidSkuCode(obj.skuCode);
            if (!isValidSku.length && !results.find(function (element) {
              return element.skuCode === obj.skuCode;
            })) results.push(obj);else if (isValidSku.length) inValidSku.push({
              Source: "Sales",
              Row: rowNum,
              Data: row,
              Error: "Invalid Sku Found"
            });else inValidSku.push({
              Source: "Sales",
              Row: rowNum,
              Data: row,
              Error: "Duplicate Sku Found"
            });
            if (!headers.length) headers = Object.keys(row);
          };

          _iterator = _asyncIterator(readSales);

        case 10:
          _context2.next = 12;
          return regeneratorRuntime.awrap(_iterator.next());

        case 12:
          _step = _context2.sent;
          _iteratorNormalCompletion = _step.done;
          _context2.next = 16;
          return regeneratorRuntime.awrap(_step.value);

        case 16:
          _value = _context2.sent;

          if (_iteratorNormalCompletion) {
            _context2.next = 22;
            break;
          }

          _loop();

        case 19:
          _iteratorNormalCompletion = true;
          _context2.next = 10;
          break;

        case 22:
          _context2.next = 28;
          break;

        case 24:
          _context2.prev = 24;
          _context2.t0 = _context2["catch"](7);
          _didIteratorError = true;
          _iteratorError = _context2.t0;

        case 28:
          _context2.prev = 28;
          _context2.prev = 29;

          if (!(!_iteratorNormalCompletion && _iterator["return"] != null)) {
            _context2.next = 33;
            break;
          }

          _context2.next = 33;
          return regeneratorRuntime.awrap(_iterator["return"]());

        case 33:
          _context2.prev = 33;

          if (!_didIteratorError) {
            _context2.next = 36;
            break;
          }

          throw _iteratorError;

        case 36:
          return _context2.finish(33);

        case 37:
          return _context2.finish(28);

        case 38:
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
            result: results,
            inValidSku: inValidSku
          });

        case 41:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[7, 24, 28, 38], [29,, 33, 37]]);
}

function readCsvOfInventory(defaultSalesHeaders, destination, clientId) {
  var readSales, err, results, inValidSku, headers, rowNum, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _loop2, _iterator2, _step2, _value2, isValidSku, checkHeaders;

  return regeneratorRuntime.async(function readCsvOfInventory$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.next = 2;
          return regeneratorRuntime.awrap(createReadStream(destination));

        case 2:
          readSales = _context3.sent;
          err = [], results = [], inValidSku = [];
          headers = [], rowNum = 0;
          _iteratorNormalCompletion2 = true;
          _didIteratorError2 = false;
          _context3.prev = 7;

          _loop2 = function _loop2() {
            var row = _value2;
            var obj = createInventoryObj(clientId, row);
            isValidSku = isValidSkuCode(obj.itemSkuCode);
            rowNum++;
            if (!isValidSku.length && !results.find(function (element) {
              return element.itemSkuCode === obj.itemSkuCode;
            })) results.push(obj);else if (isValidSku.length) inValidSku.push({
              Source: "Inventory",
              Row: rowNum,
              Data: JSON.stringify(row),
              Error: "Invalid Sku Found"
            });else inValidSku.push({
              Source: "Inventory",
              Row: rowNum,
              Data: JSON.stringify(row),
              Error: "Duplicate Sku Found"
            });
            if (!headers.length) headers = Object.keys(row);
          };

          _iterator2 = _asyncIterator(readSales);

        case 10:
          _context3.next = 12;
          return regeneratorRuntime.awrap(_iterator2.next());

        case 12:
          _step2 = _context3.sent;
          _iteratorNormalCompletion2 = _step2.done;
          _context3.next = 16;
          return regeneratorRuntime.awrap(_step2.value);

        case 16:
          _value2 = _context3.sent;

          if (_iteratorNormalCompletion2) {
            _context3.next = 22;
            break;
          }

          _loop2();

        case 19:
          _iteratorNormalCompletion2 = true;
          _context3.next = 10;
          break;

        case 22:
          _context3.next = 28;
          break;

        case 24:
          _context3.prev = 24;
          _context3.t0 = _context3["catch"](7);
          _didIteratorError2 = true;
          _iteratorError2 = _context3.t0;

        case 28:
          _context3.prev = 28;
          _context3.prev = 29;

          if (!(!_iteratorNormalCompletion2 && _iterator2["return"] != null)) {
            _context3.next = 33;
            break;
          }

          _context3.next = 33;
          return regeneratorRuntime.awrap(_iterator2["return"]());

        case 33:
          _context3.prev = 33;

          if (!_didIteratorError2) {
            _context3.next = 36;
            break;
          }

          throw _iteratorError2;

        case 36:
          return _context3.finish(33);

        case 37:
          return _context3.finish(28);

        case 38:
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
            result: results,
            inValidSku: inValidSku
          });

        case 41:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[7, 24, 28, 38], [29,, 33, 37]]);
}

router.post("/dashboardUploads", upload.fields([{
  name: "skuSales",
  maxCount: 1
}, {
  name: "skuInventory",
  maxCount: 1
}]), function _callee3(req, res) {
  var localId, client, clientId, duplicateSku, error, err, resultsobj, defaultSalesHeaders, defaultInventoryHeaders, file, _results, headerErr, _inValidSku, result, _results2, download, _file, _results3, _headerErr, _inValidSku2, _result2, _results4;

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
          clientId = client.clientId;
          duplicateSku = []; // TO DELETE THIS

          _context6.next = 9;
          return regeneratorRuntime.awrap(SkuSales.deleteMany({
            clientId: clientId
          }));

        case 9:
          _context6.next = 11;
          return regeneratorRuntime.awrap(Inventory.deleteMany({
            clientId: clientId
          }));

        case 11:
          error = [];
          err = [];
          resultsobj = {};
          defaultSalesHeaders = ["Sku Code", "Name", "Total Sales", "Day Of Inventory", "Inventory"];
          defaultInventoryHeaders = ["Facility", "Item Type Name", "Item SkuCode", "EAN", "UPC", "ISBN", "Color", "Size", "Brand", "Category Name", "MRP", "Open Sale", "Inventory", "Inventory Blocked", "Bad Inventory", "Putaway Pending", "Pending Inventory Assessment", "Stock In Transfer", "Open Purchase", "Enabled", "Cost Price"];

          if (!(req.files && req.files.skuSales && req.files.skuSales.length && req.files.skuSales[0].path)) {
            _context6.next = 39;
            break;
          }

          _context6.prev = 17;
          _context6.next = 20;
          return regeneratorRuntime.awrap(readCsvOfSales(defaultSalesHeaders, req.files.skuSales[0].path, clientId).then(function (convertedJson) {
            return convertedJson;
          }));

        case 20:
          file = _context6.sent;
          _results = file.result;
          headerErr = file.error;
          _inValidSku = file.inValidSku;
          err.push.apply(err, _toConsumableArray(headerErr));
          duplicateSku.push.apply(duplicateSku, _toConsumableArray(_inValidSku));

          if (headerErr.length) {
            _context6.next = 31;
            break;
          }

          _context6.next = 29;
          return regeneratorRuntime.awrap(SkuSales.insertMany(_results));

        case 29:
          result = _context6.sent;
          resultsobj = _objectSpread({}, resultsobj, {
            skuSales: result
          });

        case 31:
          _context6.next = 37;
          break;

        case 33:
          _context6.prev = 33;
          _context6.t0 = _context6["catch"](17);
          console.log("error", _context6.t0);
          error.push({
            message: _context6.t0
          });

        case 37:
          _context6.next = 40;
          break;

        case 39:
          if (req.body.salesUrl) {
            _results2 = [];

            download = function download(url, dest) {
              var file = fs.createWriteStream(dest);
              https.get(url, function (response) {
                response.pipe(file);
                file.on("finish", function () {
                  fs.createReadStream(dest).pipe(csvParser({})).on("headers", function (headers) {
                    if (!checkForHeaders(defaultSalesHeaders, headers)) res.json({
                      data: null,
                      error: "Headers didn't matched"
                    });
                  }).on("data", function (data) {
                    var obj = createSalesObj(clientId, data);

                    _results2.push(obj);
                  }).on("end", function _callee() {
                    var _result;

                    return regeneratorRuntime.async(function _callee$(_context4) {
                      while (1) {
                        switch (_context4.prev = _context4.next) {
                          case 0:
                            _context4.prev = 0;
                            _context4.next = 3;
                            return regeneratorRuntime.awrap(SkuSales.insertMany(_results2));

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

        case 40:
          if (!(req.files && req.files.skuInventory && req.files.skuInventory.length && req.files.skuInventory[0].path)) {
            _context6.next = 62;
            break;
          }

          _context6.prev = 41;
          _context6.next = 44;
          return regeneratorRuntime.awrap(readCsvOfInventory(defaultInventoryHeaders, req.files.skuInventory[0].path, clientId).then(function (convertedJson) {
            return convertedJson;
          }));

        case 44:
          _file = _context6.sent;
          _results3 = _file.result;
          _headerErr = _file.error;
          _inValidSku2 = _file.inValidSku;
          err.push.apply(err, _toConsumableArray(_headerErr));
          duplicateSku.push.apply(duplicateSku, _toConsumableArray(_inValidSku2));

          if (_headerErr.length) {
            _context6.next = 55;
            break;
          }

          _context6.next = 53;
          return regeneratorRuntime.awrap(Inventory.insertMany(_results3));

        case 53:
          _result2 = _context6.sent;
          resultsobj = _objectSpread({}, resultsobj, {
            inventory: _result2
          });

        case 55:
          _context6.next = 60;
          break;

        case 57:
          _context6.prev = 57;
          _context6.t1 = _context6["catch"](41);
          console.log({
            message: _context6.t1
          });

        case 60:
          _context6.next = 63;
          break;

        case 62:
          if (req.body.inventoryUrl) {
            _results4 = [];

            download = function download(url, dest) {
              var file = fs.createWriteStream(dest);
              https.get(url, function (response) {
                response.pipe(file);
                file.on("finish", function () {
                  fs.createReadStream(dest).pipe(csvParser({})).on("headers", function (headers) {
                    if (!checkForHeaders(defaultInventoryHeaders, headers)) res.json({
                      data: null,
                      error: "Headers didn't matched"
                    });
                  }).on("data", function (data) {
                    var obj = createInventoryObj(clientId, data);

                    _results4.push(obj);
                  }).on("end", function _callee2() {
                    var _result3;

                    return regeneratorRuntime.async(function _callee2$(_context5) {
                      while (1) {
                        switch (_context5.prev = _context5.next) {
                          case 0:
                            _context5.prev = 0;
                            _context5.next = 3;
                            return regeneratorRuntime.awrap(Inventory.insertMany(_results4));

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

        case 63:
          // console.log("err", err);
          if (err.length) {
            exportCsv(res, err);
          } else {
            if (duplicateSku.length) exportCsv(res, duplicateSku);
            styleTraffic(clientId, resultsobj).then(function (dashboard) {// console.log(dashboard);
            });
          }

          _context6.next = 69;
          break;

        case 66:
          _context6.prev = 66;
          _context6.t2 = _context6["catch"](0);
          res.status(400).json({
            message1: _context6.t2
          });

        case 69:
        case "end":
          return _context6.stop();
      }
    }
  }, null, null, [[0, 66], [17, 33], [41, 57]]);
}); //FUNCTIONS FOR STYLETRAFFIC 

var setSuggestedSmoothInv = function setSuggestedSmoothInv(suggestedInventoryX) {
  if (suggestedInventoryX < 100) return Math.round(suggestedInventoryX / 10) * 10;else return Math.round(suggestedInventoryX / 100) * 100;
};

var setSuggestedInv = function setSuggestedInv(planDayX, TotalSales, inventory) {
  if (planDayX / 30 * TotalSales - inventory > 0) return planDayX / 30 * TotalSales - inventory;else return 0;
};

var setDashboardObj = function setDashboardObj(clientId, styleCode, trafficActual, trafficVirtual, status, currentInv, salesNumber, salesRank, replenishmentRank) {
  var obj = {
    clientId: clientId,
    styleCode: styleCode,
    trafficActual: trafficActual,
    trafficVirtual: trafficVirtual,
    status: status,
    currentInv: currentInv,
    salesNumber: salesNumber,
    salesRank: salesRank,
    replenishmentRank: replenishmentRank
  };
  return obj;
};

var setSummaryObj = function setSummaryObj(summaryObj) {
  var obj = {
    soldout: summaryObj["SOLDOUT"] || 0,
    red: summaryObj["RED"] || 0,
    orange: summaryObj["ORANGE"] || 0,
    green: summaryObj["GREEN"] || 0,
    overgreen: summaryObj["OVERGREEN"] || 0,
    updated: Date.now()
  };
  return obj;
};

var getItemMasterObj = function getItemMasterObj(clientId, skuCode, styleCode, sizeCode, TotalSales, DayOfInventory, inventory, dayInventory, trafficColor, trafficShortCode, skuTrafficCode, suggestedInventory1, suggestedSmoothInventory1, suggestedInventory2, suggestedSmoothInventory2, suggestedInventory3, suggestedSmoothInventory3) {
  var itemMasterObj = {
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
    trafficColor: trafficColor,
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
  return itemMasterObj;
};

var styleTraffic = function styleTraffic(clientId, resultsobj) {
  var i, itemMaster, _ret;

  return regeneratorRuntime.async(function styleTraffic$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          _context8.prev = 0;
          _context8.next = 3;
          return regeneratorRuntime.awrap(function _callee4() {
            var allSkus, allSkuSales, allSkuInventory, styleMaster, skuSalesMap, skuInvMap, skuSalesData, skuInventoryData, totalInventoryOfStylecode, totalSalesOfStylecode, _i, _skuSalesData, _skuInventoryData, TotalSales, DayOfInventory, inventory, styleCode, skuCode, sizeCode, prevInventory, prevSales, dayInventory, _trafficColor, trafficShortCode, skuTrafficCode, planDay1, planDay2, planDay3, suggestedInventory1, suggestedInventory2, suggestedInventory3, suggestedSmoothInventory1, suggestedSmoothInventory2, suggestedSmoothInventory3, itemMasterObj, Item, colorCount, colorScore, colorProduct, replenishmentRank, salesRank, trafficColor, finalArray, summaryObj, _loop3, _i2, summary, dashboard, summaryRes;

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
                      suggestedInventory1 = setSuggestedInv(planDay1, TotalSales, inventory), suggestedInventory2 = setSuggestedInv(planDay2, TotalSales, inventory), suggestedInventory3 = setSuggestedInv(planDay3, TotalSales, inventory);
                      suggestedSmoothInventory1 = setSuggestedSmoothInv(suggestedInventory1), suggestedSmoothInventory2 = setSuggestedSmoothInv(suggestedInventory2), suggestedSmoothInventory3 = setSuggestedSmoothInv(suggestedInventory3); //MAPPING STYLECODES WITH TRAFFIC COLOR ----START

                      trafficColorCountUsingStyleCode(styleCode, _trafficColor);
                      itemMasterObj = getItemMasterObj(clientId, skuCode, styleCode, sizeCode, TotalSales, DayOfInventory, inventory, dayInventory, _trafficColor, trafficShortCode, skuTrafficCode, suggestedInventory1, suggestedSmoothInventory1, suggestedInventory2, suggestedSmoothInventory2, suggestedInventory3, suggestedSmoothInventory3);
                      itemMaster.push(itemMasterObj);
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
                    summaryObj = {};

                    _loop3 = function _loop3(_i2) {
                      var styleCode = styleCodeArr[_i2],
                          currentInv = totalInventoryOfStylecode.get(styleCode),
                          salesNumber = totalSalesOfStylecode.get(styleCode),
                          status = styleMaster.find(function (ele) {
                        return ele.styleCode === styleCode;
                      }).status;

                      if (status === null) {
                        status = "Live";
                      }

                      var obj = setDashboardObj(clientId, styleCode, trafficColor.get(styleCode), trafficColor.get(styleCode), status, currentInv, salesNumber, salesRank.get(styleCode), replenishmentRank.get(styleCode));
                      if (!summaryObj[obj.trafficActual]) summaryObj[obj.trafficActual] = 0;
                      summaryObj[obj.trafficActual] += 1; //CHECK WHY IT'S NOT WORKING
                      // console.log(obj);

                      finalArray.push(obj);
                    };

                    for (_i2 = 0; _i2 < styleCodeArr.length; _i2++) {
                      _loop3(_i2);
                    }

                    finalArray.sort(function (a, b) {
                      return a.salesRank - b.salesRank;
                    });
                    summary = setSummaryObj(summaryObj);
                    _context7.next = 40;
                    return regeneratorRuntime.awrap(StyleTraffic.insertMany(finalArray));

                  case 40:
                    dashboard = _context7.sent;
                    _context7.next = 43;
                    return regeneratorRuntime.awrap(Summary.updateOne({
                      clientId: clientId
                    }, {
                      dashboard: summary
                    }, {
                      "new": true
                    }));

                  case 43:
                    summaryRes = _context7.sent;
                    return _context7.abrupt("return", {
                      v: {
                        data: dashboard,
                        summary: summaryRes,
                        resultsobj: resultsobj,
                        error: null
                      }
                    });

                  case 45:
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
          console.log({
            errorMessage: _context8.t0
          });

        case 11:
        case "end":
          return _context8.stop();
      }
    }
  }, null, null, [[0, 8]]);
};

router.get("/styleTraffic", function _callee6(req, res) {
  var sessionCookie;
  return regeneratorRuntime.async(function _callee6$(_context10) {
    while (1) {
      switch (_context10.prev = _context10.next) {
        case 0:
          sessionCookie = req.cookies.session || "";
          admin.auth().verifySessionCookie(sessionCookie, true
          /** checkRevoked */
          ).then(function _callee5(userData) {
            var localId, client, _clientId, dashBoard;

            return regeneratorRuntime.async(function _callee5$(_context9) {
              while (1) {
                switch (_context9.prev = _context9.next) {
                  case 0:
                    console.log("Logged in:", userData.email);
                    _context9.prev = 1;
                    localId = req.cookies.LocalId;
                    _context9.next = 5;
                    return regeneratorRuntime.awrap(Client.findOne({
                      password: localId
                    }));

                  case 5:
                    client = _context9.sent;
                    _clientId = client.clientId;
                    _context9.next = 9;
                    return regeneratorRuntime.awrap(StyleTraffic.find({
                      clientId: _clientId
                    }));

                  case 9:
                    dashBoard = _context9.sent;
                    res.json({
                      data: dashBoard,
                      error: null
                    });
                    _context9.next = 16;
                    break;

                  case 13:
                    _context9.prev = 13;
                    _context9.t0 = _context9["catch"](1);
                    res.json({
                      data: null,
                      error: _context9.t0
                    });

                  case 16:
                  case "end":
                    return _context9.stop();
                }
              }
            }, null, null, [[1, 13]]);
          })["catch"](function (error) {
            res.redirect("/signin");
          });

        case 2:
        case "end":
          return _context10.stop();
      }
    }
  });
});
router.patch("/styleTraffic", function _callee7(req, res) {
  var responseStatus, date, today, status;
  return regeneratorRuntime.async(function _callee7$(_context11) {
    while (1) {
      switch (_context11.prev = _context11.next) {
        case 0:
          responseStatus = "NA";
          date = new Date(req.body.date);
          today = new Date();
          status = req.body.status;
          if (status === "Completed") responseStatus = "Completed";else if (date !== null) {
            if (date > today) responseStatus = "In Progress";else responseStatus = "Expired";
          }
          res.json({
            responseStatus: responseStatus
          });

        case 6:
        case "end":
          return _context11.stop();
      }
    }
  });
});

var exportCsv = function exportCsv(res, json) {
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
      res.set("Content-Type", "application/csv");
      res.download(destination);
    });
  } catch (err) {
    console.error(err);
  }
};

module.exports = router;