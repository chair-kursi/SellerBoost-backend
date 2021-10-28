"use strict";

var express = require('express');

var router = express.Router();

var MarketplaceHealth = require('../models/MarketplaceHealth');

var fs = require("fs");

var csvParser = require("csv-parser");

var https = require('https');

var SkuMaster = require('../models/SkuMaster');

var StyleTraffic = require('../models/StyleTraffic');

var SkuError = require("../models/SkuError");

var Summary = require('../models/Summary');

var _require = require('../services/getClientId'),
    getClientId = _require.getClientId;

router.post("/marketplaceHealth", function _callee2(req, res) {
  var localId, client, clientId, skuMaster, styleTraffic, styleCodeMap, i, results, styleCodeArr, reasonArrMap, temporary, channelCodeArr, download;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          localId = req.cookies.LocalId;
          _context2.next = 4;
          return regeneratorRuntime.awrap(Client.findOne({
            password: localId
          }));

        case 4:
          client = _context2.sent;
          clientId = client.clientId;
          _context2.next = 8;
          return regeneratorRuntime.awrap(MarketplaceHealth.deleteMany({}));

        case 8:
          _context2.next = 10;
          return regeneratorRuntime.awrap(SkuMaster.find({}));

        case 10:
          skuMaster = _context2.sent;
          _context2.next = 13;
          return regeneratorRuntime.awrap(StyleTraffic.find({}));

        case 13:
          styleTraffic = _context2.sent;
          styleCodeMap = new Map();

          for (i = 0; i < skuMaster.length; i++) {
            if (!styleCodeMap.get(skuMaster[i].styleCode)) styleCodeMap.set(skuMaster[i].styleCode, [skuMaster[i].skuCode]);else styleCodeMap.get(skuMaster[i].styleCode).push(skuMaster[i].skuCode);
          }

          results = [];
          styleCodeArr = [];
          reasonArrMap = new Map();
          temporary = [];
          channelCodeArr = [];

          download = function download(url, dest) {
            var file = fs.createWriteStream(dest);
            https.get(url, function (response) {
              response.pipe(file);
              file.on('finish', function () {
                fs.createReadStream(dest).pipe(csvParser({})).on("data", function (data) {
                  return results.push(data);
                }).on("end", function _callee() {
                  var skuError, i, obj, temp, reasonSizeArr, data, summary, finalArr, tempArr, cnt, _loop, j, k, result1, result;

                  return regeneratorRuntime.async(function _callee$(_context) {
                    while (1) {
                      switch (_context.prev = _context.next) {
                        case 0:
                          skuError = [];
                          i = 0;

                        case 2:
                          if (!(i < results.length)) {
                            _context.next = 16;
                            break;
                          }

                          obj = {
                            channelCode: results[i]["Channel Code"],
                            sellerSkuOnChannel: results[i]["Seller SKU on Channel"],
                            disabledDueToErrors: results[i]["Disabled Due To Errors"] === 'true' ? true : false,
                            skuCode: results[i]["SKU Code"],
                            disabledManually: results[i]["Manually Disabled"] === 'true' ? true : false
                          };
                          temp = skuMaster.find(function (ele) {
                            return ele.skuCode === obj.skuCode;
                          });

                          if (temp) {
                            _context.next = 8;
                            break;
                          }

                          skuError.push({
                            skuCode: obj.skuCode
                          });
                          return _context.abrupt("continue", 13);

                        case 8:
                          reasonSizeArr = new Array();
                          reasonSizeArr.push({
                            disabledManually: obj.disabledManually,
                            skuCode: obj.skuCode,
                            sizeCode: temp.sizeCode,
                            channelCode: obj.channelCode,
                            styleCode: temp.styleCode,
                            disabledDueToErrors: obj.disabledDueToErrors
                          });
                          if (reasonArrMap.get(temp.styleCode)) reasonArrMap.get(temp.styleCode).push({
                            disabledManually: obj.disabledManually,
                            skuCode: obj.skuCode,
                            sizeCode: temp.sizeCode,
                            channelCode: obj.channelCode,
                            styleCode: temp.styleCode,
                            disabledDueToErrors: obj.disabledDueToErrors
                          });else reasonArrMap.set(temp.styleCode, reasonSizeArr);
                          if (!styleCodeArr.find(function (ele) {
                            return ele === temp.styleCode;
                          })) styleCodeArr.push(temp.styleCode);
                          if (!channelCodeArr.find(function (ele) {
                            return ele === obj.channelCode;
                          })) channelCodeArr.push(obj.channelCode);

                        case 13:
                          i++;
                          _context.next = 2;
                          break;

                        case 16:
                          data = {}, summary = [];

                          for (i = 0; i < channelCodeArr.length; i++) {
                            finalArr = [], tempArr = [];
                            cnt = 0;

                            _loop = function _loop() {
                              var arr = reasonArrMap.get(styleCodeArr[j]);
                              var newArr = arr.filter(function (ele) {
                                return ele.channelCode === channelCodeArr[i];
                              });
                              var totalSkus = styleCodeMap.get(styleCodeArr[j]);
                              var missingArr = [];

                              for (k = 0; k < newArr.length; k++) {
                                if (!totalSkus.find(function (ele) {
                                  return ele === newArr[k].skuCode;
                                })) missingArr.push(newArr[k].sizeCode);
                              }

                              var disabledArr = newArr.filter(function (ele) {
                                return ele.disabledManually || ele.disabledDueToErrors;
                              }).map(function (ele) {
                                return ele.sizeCode;
                              });
                              var currentStyle = styleTraffic.filter(function (ele) {
                                return ele.styleCode === styleCodeArr[j];
                              }).map(function (ele) {
                                return ele;
                              });
                              var marketplaceCount = missingArr.length + (newArr.length - disabledArr.length); // if(disabledArr.length)
                              // {
                              //   console.log("Disabled", styleCodeArr[j]);
                              // }
                              // if(missingArr.length)
                              // {
                              //   console.log("missingArr", styleCodeArr[j]);
                              // }

                              var obj = {
                                rank: currentStyle[0].salesRank,
                                inventory: currentStyle[0].currentInv,
                                marketplace: channelCodeArr[i],
                                styleCode: styleCodeArr[j],
                                baseCount: totalSkus.length ? totalSkus.length : 0,
                                marketplaceCount: marketplaceCount > 0 ? marketplaceCount : 0,
                                reason: {
                                  disabled: disabledArr,
                                  missing: missingArr
                                }
                              };
                              if (obj.baseCount > obj.marketplaceCount && (disabledArr.length || missingArr.length)) finalArr.push(obj); // if (styleCodeArr[j] === "SB-000119")
                              //   console.log(channelCodeArr[i], styleCodeMap.get("SB-000119").length, missingArr, disabledArr.length, obj.marketplaceCount);
                            };

                            for (j = 0; j < styleCodeArr.length; j++) {
                              _loop();
                            }

                            finalArr.sort(function (a, b) {
                              return a.rank - b.rank;
                            });
                            data[channelCodeArr[i]] = finalArr;
                            summary.push({
                              channelCode: channelCodeArr[i],
                              mismatch: finalArr.length
                            });
                          } // SB-000119


                          _context.prev = 18;
                          result1 = new MarketplaceHealth(data);
                          _context.next = 22;
                          return regeneratorRuntime.awrap(result1.save());

                        case 22:
                          result = _context.sent;
                          skuError.sort(function (a, b) {
                            return a[1] - b[1];
                          });
                          _context.next = 26;
                          return regeneratorRuntime.awrap(SkuError.insertMany(skuError));

                        case 26:
                          _context.next = 28;
                          return regeneratorRuntime.awrap(Summary.updateMany({
                            clientId: clientId
                          }, {
                            marketplaceHealth: {
                              channels: summary,
                              updated: Date.now()
                            },
                            skuError: {
                              errorCount: skuError.length,
                              updated: Date.now()
                            },
                            updated: Date.now()
                          }, {
                            "new": true
                          }));

                        case 28:
                          res.json({
                            data: result,
                            channels: summary,
                            skuError: skuError.length,
                            error: null
                          });
                          fs.unlink(dest, function (err) {
                            //deleting created file
                            if (err) throw err;
                            console.log("deleted");
                          });
                          _context.next = 35;
                          break;

                        case 32:
                          _context.prev = 32;
                          _context.t0 = _context["catch"](18);
                          res.json({
                            message: _context.t0
                          });

                        case 35:
                        case "end":
                          return _context.stop();
                      }
                    }
                  }, null, null, [[18, 32]]);
                });
              });
            });
          };

          download(req.body.fileUrl, "csvFiles/MarketplaceHealth.csv");
          _context2.next = 28;
          break;

        case 25:
          _context2.prev = 25;
          _context2.t0 = _context2["catch"](0);
          res.json({
            message: _context2.t0
          });

        case 28:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 25]]);
});
router.get("/marketplaceHealth", function _callee3(req, res) {
  var localId, client, _clientId, marketplaceHealth, summary;

  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          localId = req.cookies.LocalId; // if(!localId)
          // localId="6N9yuxkxf6MhmSdOZuvAuze3l943";

          _context3.next = 4;
          return regeneratorRuntime.awrap(Client.findOne({
            password: localId
          }));

        case 4:
          client = _context3.sent;
          _clientId = client.clientId;
          _context3.next = 8;
          return regeneratorRuntime.awrap(MarketplaceHealth.find({}));

        case 8:
          marketplaceHealth = _context3.sent;
          _context3.next = 11;
          return regeneratorRuntime.awrap(Summary.findOne({
            clientId: _clientId
          }));

        case 11:
          summary = _context3.sent;
          res.json({
            data: marketplaceHealth[0],
            summary: summary,
            error: null
          });
          _context3.next = 18;
          break;

        case 15:
          _context3.prev = 15;
          _context3.t0 = _context3["catch"](0);
          res.json({
            message: _context3.t0
          });

        case 18:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[0, 15]]);
});
module.exports = router;