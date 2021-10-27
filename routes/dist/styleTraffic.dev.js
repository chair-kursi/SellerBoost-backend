"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

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

var Client = require("../models/Client"); //DEFINING CONSTATNTS


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
    EAN: parseInt(data["EAN"]),
    UPC: parseInt(data["UPC"]),
    ISBN: parseInt(data["ISBN"]),
    color: data["Color"],
    size: data["Size"],
    brand: data["Brand"],
    categoryName: data["Category Name"],
    MRP: parseFloat(data["MRP"]),
    openSale: parseInt(data["Open Sale"]),
    inventory: parseInt(data["Inventory"]),
    inventoryBlocked: parseInt(data["Inventory Blocked"]),
    badInventory: parseInt(data["Bad Inventory"]),
    putawayPending: parseInt(data["Putaway Pending"]),
    pendingInventoryAssessment: parseInt(data["Pending Inventory Assessment"]),
    stockInTransfer: parseInt(data["Stock In Transfer"]),
    openPurchase: parseInt(data["Open Purchase"]),
    enabled: data["Enabled"],
    costPrice: parseInt(data["Cost Price"])
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

var upload = multer({
  storage: fileStorageEngine
});
router.post("/dashboardUploads", upload.fields([{
  name: 'skuSales',
  maxCount: 1
}, {
  name: 'skuInventory',
  maxCount: 1
}]), function _callee5(req, res) {
  var localId, client, clientId, err, error, resjson, results, _results, download, _results2, _results3;

  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;
          localId = req.cookies.LocalId; // if(!localId)
          // localId="6N9yuxkxf6MhmSdOZuvAuze3l943";

          _context5.next = 4;
          return regeneratorRuntime.awrap(Client.findOne({
            password: localId
          }));

        case 4:
          client = _context5.sent;
          clientId = client.clientId; // TO DELETE THIS
          // await SkuSales.deleteMany({ clientId: clientId });
          // await Inventory.deleteMany({ clientId: clientId });
          // res.send("ok deleted");

          err = [], error = [];
          resjson = [];

          if (req.files && req.files.skuSales && req.files.skuSales.length && req.files.skuSales[0].path) {
            results = [];
            fs.createReadStream(req.files.skuSales[0].path).pipe(csvParser({})).on("data", function (data) {
              var obj = createSalesObj(clientId, data);
              results.push(obj);
            }).on("end", function _callee() {
              var result;
              return regeneratorRuntime.async(function _callee$(_context) {
                while (1) {
                  switch (_context.prev = _context.next) {
                    case 0:
                      _context.prev = 0;
                      _context.next = 3;
                      return regeneratorRuntime.awrap(SkuSales.insertMany(results));

                    case 3:
                      result = _context.sent;
                      resjson = [].concat(_toConsumableArray(resjson), [result]);
                      console.log("Resp of saving skuSales in DB", result);
                      _context.next = 12;
                      break;

                    case 8:
                      _context.prev = 8;
                      _context.t0 = _context["catch"](0);
                      console.log("error", _context.t0);
                      error.push({
                        message: _context.t0
                      });

                    case 12:
                    case "end":
                      return _context.stop();
                  }
                }
              }, null, null, [[0, 8]]);
            });
          } else if (req.body.salesUrl) {
            _results = [];

            download = function download(url, dest) {
              var file = fs.createWriteStream(dest);
              https.get(url, function (response) {
                response.pipe(file);
                file.on('finish', function () {
                  fs.createReadStream(dest).pipe(csvParser({})).on("data", function (data) {
                    var obj = createSalesObj(clientId, data);

                    _results.push(obj);
                  }).on("end", function _callee2() {
                    var result;
                    return regeneratorRuntime.async(function _callee2$(_context2) {
                      while (1) {
                        switch (_context2.prev = _context2.next) {
                          case 0:
                            _context2.prev = 0;
                            _context2.next = 3;
                            return regeneratorRuntime.awrap(SkuSales.insertMany(_results));

                          case 3:
                            result = _context2.sent;
                            resjson.push(result);
                            fs.unlink(dest, function (err) {
                              //deleting created file
                              if (err) throw err;
                              console.log("deleted");
                            });
                            _context2.next = 11;
                            break;

                          case 8:
                            _context2.prev = 8;
                            _context2.t0 = _context2["catch"](0);
                            error.push({
                              message: _context2.t0
                            });

                          case 11:
                          case "end":
                            return _context2.stop();
                        }
                      }
                    }, null, null, [[0, 8]]);
                  });
                });
              });
            };

            download(req.body.fileUrl, "csvFiles/SKUSALES" + Date.now());
          } else err.push({
            field: "skuSales",
            error: "Not Found"
          });

          if (req.files && req.files.skuInventory && req.files.skuInventory.length && req.files.skuInventory[0].path) {
            _results2 = [];
            fs.createReadStream(req.files.skuInventory[0].path).pipe(csvParser({})).on("data", function (data) {
              var obj = createInventoryObj(clientId, data);

              _results2.push(obj);
            }).on("end", function _callee3() {
              var result;
              return regeneratorRuntime.async(function _callee3$(_context3) {
                while (1) {
                  switch (_context3.prev = _context3.next) {
                    case 0:
                      _context3.prev = 0;
                      _context3.next = 3;
                      return regeneratorRuntime.awrap(Inventory.insertMany(_results2));

                    case 3:
                      result = _context3.sent;
                      // console.log(result);
                      resjson = [].concat(_toConsumableArray(resjson), [result]);
                      _context3.next = 10;
                      break;

                    case 7:
                      _context3.prev = 7;
                      _context3.t0 = _context3["catch"](0);
                      error.push({
                        message: _context3.t0
                      });

                    case 10:
                    case "end":
                      return _context3.stop();
                  }
                }
              }, null, null, [[0, 7]]);
            });
          } else if (req.body.inventoryUrl) {
            _results3 = [];

            download = function download(url, dest) {
              var file = fs.createWriteStream(dest);
              https.get(url, function (response) {
                response.pipe(file);
                file.on('finish', function () {
                  fs.createReadStream(dest).pipe(csvParser({})).on("data", function (data) {
                    var obj = createInventoryObj(clientId, data);

                    _results3.push(obj);
                  }).on("end", function _callee4() {
                    var result;
                    return regeneratorRuntime.async(function _callee4$(_context4) {
                      while (1) {
                        switch (_context4.prev = _context4.next) {
                          case 0:
                            _context4.prev = 0;
                            _context4.next = 3;
                            return regeneratorRuntime.awrap(Inventory.insertMany(_results3));

                          case 3:
                            result = _context4.sent;
                            resjson = [].concat(_toConsumableArray(resjson), [result]);
                            _context4.next = 10;
                            break;

                          case 7:
                            _context4.prev = 7;
                            _context4.t0 = _context4["catch"](0);
                            error.push({
                              message: _context4.t0
                            });

                          case 10:
                          case "end":
                            return _context4.stop();
                        }
                      }
                    }, null, null, [[0, 7]]);
                  });
                });
              });
            };

            download(req.body.fileUrl, "csvFiles/INVENTORY" + Date.now());
          } else err.push({
            field: "skuInventory",
            error: "Not Found"
          });

          console.log(resjson);

          if (err.length) {
            res.status(400).json(err);
          } else {
            styleTraffic(req, res);
          }

          _context5.next = 17;
          break;

        case 14:
          _context5.prev = 14;
          _context5.t0 = _context5["catch"](0);
          res.status(400).json({
            message1: _context5.t0
          });

        case 17:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[0, 14]]);
});

var styleTraffic = function styleTraffic(req, res) {
  var localId, i, itemMaster;
  return regeneratorRuntime.async(function styleTraffic$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          _context7.prev = 0;
          _context7.next = 3;
          return regeneratorRuntime.awrap(function _callee6() {
            var client, clientId, allSkus, allSkuSales, allSkuInventory, styleMaster, skuSalesMap, skuInvMap, skuSalesData, skuInventoryData, totalInventoryOfStylecode, totalSalesOfStylecode, _i, _skuSalesData, _skuInventoryData, TotalSales, DayOfInventory, inventory, styleCode, skuCode, sizeCode, prevInventory, prevSales, dayInventory, _trafficColor, trafficShortCode, skuTrafficCode, planDay1, planDay2, planDay3, suggestedInventory1, suggestedInventory2, suggestedInventory3, suggestedSmoothInventory1, suggestedSmoothInventory2, suggestedSmoothInventory3, skuData, Item, colorCount, colorScore, colorProduct, replenishmentRank, salesRank, trafficColor, finalArray, statusArr, summaryObj, _loop, _i2, summary, dashboard;

            return regeneratorRuntime.async(function _callee6$(_context6) {
              while (1) {
                switch (_context6.prev = _context6.next) {
                  case 0:
                    localId = req.cookies.LocalId; // if(!localId)
                    // localId="6N9yuxkxf6MhmSdOZuvAuze3l943";

                    _context6.next = 3;
                    return regeneratorRuntime.awrap(Client.findOne({
                      password: localId
                    }));

                  case 3:
                    client = _context6.sent;
                    clientId = client.clientId;
                    _context6.next = 7;
                    return regeneratorRuntime.awrap(SkuTrafficMongo.deleteMany({
                      clientId: clientId
                    }));

                  case 7:
                    _context6.next = 9;
                    return regeneratorRuntime.awrap(StyleTraffic.deleteMany({
                      clientId: clientId
                    }));

                  case 9:
                    _context6.next = 11;
                    return regeneratorRuntime.awrap(SkuMaster.find({
                      clientId: clientId
                    }));

                  case 11:
                    allSkus = _context6.sent;
                    _context6.next = 14;
                    return regeneratorRuntime.awrap(SkuSales.find({
                      clientId: clientId
                    }));

                  case 14:
                    allSkuSales = _context6.sent;
                    _context6.next = 17;
                    return regeneratorRuntime.awrap(Inventory.find({
                      clientId: clientId
                    }));

                  case 17:
                    allSkuInventory = _context6.sent;
                    _context6.next = 20;
                    return regeneratorRuntime.awrap(Style.find({
                      clientId: clientId
                    }));

                  case 20:
                    styleMaster = _context6.sent;
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

                    _context6.next = 30;
                    return regeneratorRuntime.awrap(SkuTrafficMongo.insertMany(itemMaster));

                  case 30:
                    Item = _context6.sent;
                    console.log("itemMaster", Item); //SETTING TRAFFIC COLORS COUNT 

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
                      soldout: summaryObj["SOLDOUT"],
                      red: summaryObj["RED"],
                      orange: summaryObj["ORANGE"],
                      green: summaryObj["GREEN"],
                      overgreen: summaryObj["OVERGREEN"],
                      updated: Date.now()
                    };
                    _context6.next = 47;
                    return regeneratorRuntime.awrap(StyleTraffic.insertMany(finalArray));

                  case 47:
                    dashboard = _context6.sent;
                    _context6.next = 50;
                    return regeneratorRuntime.awrap(Summary.updateOne({
                      clientId: clientId
                    }, {
                      dashboard: summary
                    }, {
                      "new": true
                    }));

                  case 50:
                    res.json({
                      data: dashboard,
                      summary: summary,
                      error: null
                    });

                  case 51:
                  case "end":
                    return _context6.stop();
                }
              }
            });
          }());

        case 3:
          _context7.next = 8;
          break;

        case 5:
          _context7.prev = 5;
          _context7.t0 = _context7["catch"](0);
          res.status(400).json({
            message: _context7.t0
          });

        case 8:
        case "end":
          return _context7.stop();
      }
    }
  }, null, null, [[0, 5]]);
};

router.get("/styleTraffic", function _callee7(req, res) {
  var localId, client, _clientId, dashBoard, summary;

  return regeneratorRuntime.async(function _callee7$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          _context8.prev = 0;
          localId = req.cookies.LocalId; // if(!localId)
          // localId="6N9yuxkxf6MhmSdOZuvAuze3l943"; 

          _context8.next = 4;
          return regeneratorRuntime.awrap(Client.findOne({
            password: localId
          }));

        case 4:
          client = _context8.sent;
          _clientId = client.clientId;
          _context8.next = 8;
          return regeneratorRuntime.awrap(StyleTraffic.find({
            clientId: _clientId
          }));

        case 8:
          dashBoard = _context8.sent;
          _context8.next = 11;
          return regeneratorRuntime.awrap(Summary.findOne({
            clientId: _clientId
          }));

        case 11:
          summary = _context8.sent;
          res.json({
            data: dashBoard,
            summary: summary,
            error: null
          });
          _context8.next = 18;
          break;

        case 15:
          _context8.prev = 15;
          _context8.t0 = _context8["catch"](0);
          res.json({
            data: null,
            error: _context8.t0
          });

        case 18:
        case "end":
          return _context8.stop();
      }
    }
  }, null, null, [[0, 15]]);
});
router.get("/exportCsv", function _callee8(req, res) {
  var client, clientId, dashboard, fields, opts, parser, csv;
  return regeneratorRuntime.async(function _callee8$(_context9) {
    while (1) {
      switch (_context9.prev = _context9.next) {
        case 0:
          _context9.next = 2;
          return regeneratorRuntime.awrap(Client.findOne({
            password: req.cookies.LocalId
          }));

        case 2:
          client = _context9.sent;
          clientId = client.clientId;
          _context9.next = 6;
          return regeneratorRuntime.awrap(StyleTraffic.find({
            clientId: clientId
          }));

        case 6:
          dashboard = _context9.sent;
          fields = ["clientId", "styleCode", "trafficActual", "trafficVirtual", "currentInv", "salesNumber", "salesRank", "replenishmentRank"];
          opts = {
            fields: fields
          };

          try {
            parser = new Parser(opts);
            csv = parser.parse(dashboard);
            fs.writeFile("csvFiles/csv.csv", csv, function (err) {
              if (err) throw err;
              res.attachment("csvFiles/csv.csv"); // res.writeHead(200, {'Content-Type': 'application/csv'}); 
              // res.setHeader("'Content-Type', 'application/csv'")

              res.set('Content-Type', 'application/csv');
              res.download("csvFiles/csv.csv");
              console.log("file Saved"); // fs.unlink('csvFiles/EXPORT_CSV.csv', (err) => {
              //     if (err) throw err;
              //     console.log('csvFiles/EXPORT_CSV.csv was deleted');
              // })
            }); // res.status(200).send(csv);
          } catch (err) {
            console.error(err);
          }

        case 10:
        case "end":
          return _context9.stop();
      }
    }
  });
});
module.exports = router;