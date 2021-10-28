"use strict";

var express = require('express');

var SizeMaster = require('../models/SizeMaster');

var SkuMaster = require('../models/SkuMaster');

var Style = require('../models/Style');

var _require = require('../validators/sizesValidators'),
    validateSize = _require.validateSize;

var _require2 = require('../validators/skusValidators'),
    validateSku = _require2.validateSku;

var _require3 = require('../validators/stylesValidator'),
    validateStyle = _require3.validateStyle;

var router = express.Router();

var csvParser = require("csv-parser");

var multer = require("multer");

var fs = require("fs");

var Client = require('../models/Client');

var _require4 = require('json2csv'),
    Parser = _require4.Parser;

var removeDuplicates = function removeDuplicates(master, masterInMongo, throwErr) {
  try {
    var masterData = [],
        error = [];

    for (var i = 0; i < master.length; i++) {
      // console.log(i, master[i]);
      //FOR STYLECODES
      var obj = {};

      if (master[i].styleCode && !masterInMongo.find(function (ele) {
        return ele.styleCode === master[i].styleCode;
      })) {
        obj = master[i];
      } //FOR SKUCODES


      if (master[i].skuCode && !masterInMongo.find(function (ele) {
        return ele.skuCode === master[i].skuCode;
      })) {
        obj = master[i];
      } else if (master[i].skuCode && throwErr) error.push({
        Source: "SKU Upload",
        Data: master[i],
        Row: i + 1,
        Error: "SKU Already Uploaded"
      }); //FOR SIZECODES


      if (master[i].sizeCode && !masterInMongo.find(function (ele) {
        return ele.sizeCode === master[i].sizeCode;
      })) {
        obj = master[i];
      }

      if (Object.keys(obj).length) masterData.push(obj);
    }

    return {
      error: error,
      master: masterData
    };
  } catch (err) {
    res.status(404).json({
      message: err
    });
  }
}; //MULTER START


var fileStorageEngine = multer.diskStorage({
  destination: function destination(res, file, cb) {
    cb(null, "./csvFiles");
  },
  filename: function filename(req, file, cb) {
    cb(null, Date.now() + "__" + file.originalname);
  }
});
var upload = multer({
  storage: fileStorageEngine
}); //MULTER END

var exportCsv = function exportCsv(res, json) {
  var fields, opts, parser, csv, destination;
  return regeneratorRuntime.async(function exportCsv$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          fields = ["Source", "Row", "Data", "Error"];
          opts = {
            fields: fields
          };

          try {
            parser = new Parser(opts);
            csv = parser.parse(json);
            destination = "csvFiles/SetUpError" + Date.now() + ".csv";
            fs.writeFile(destination, csv, function (err) {
              if (err) throw err;
              res.set('Content-Type', 'application/csv');
              res.download(destination);
            });
          } catch (err) {
            console.error(err);
          }

        case 3:
        case "end":
          return _context.stop();
      }
    }
  });
};

router.post('/setUp', upload.single("csvFile"), function _callee2(req, res) {
  var localId, client, clientId, error, styleCodes, sizeCodes, skuCodes, duplicateSku, results;
  return regeneratorRuntime.async(function _callee2$(_context3) {
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
          clientId = client.clientId; //DELETING FOR TESTING
          // await SkuMaster.deleteMany({ clientId: clientId });
          // await Style.deleteMany({ clientId: clientId });
          // res.send("OK Deleted SKUS");

          error = [], styleCodes = [], sizeCodes = [], skuCodes = [], duplicateSku = [], results = [];

          if (req.file && req.file.path) {
            fs.createReadStream(req.file.path).pipe(csvParser({})).on("data", function (data) {
              results.push(data); // const errorStatus = [];

              var styleObj = {
                clientId: clientId,
                status: null,
                styleCode: data["Style Code"],
                frontImageUrl: data['Front Image Url']
              }; // if (Object.keys(validateStyle(styleObj)).length)
              //     {
              //         error.push({ Source: "SKU Upload",Row: results.length, Data: data, error: validateStyle(styleObj).error.errorCode });
              //         errorStatus.push(styleObj.styleCode);
              // }
              // if (Object.keys(validateStyle(styleObj)).length) {
              //     error.push({ Source: "SKU Upload", Row: results.length, Data: data, error: validateStyle(styleObj).error.errorCode });
              //     errorStatus.push(styleObj.styleCode);
              // }
              // else 

              if (!styleCodes.find(function (ele) {
                return ele.styleCode === styleObj.styleCode;
              })) styleCodes.push(styleObj);
              var skuObj = {
                clientId: clientId,
                styleCode: data["Style Code"],
                skuCode: data["SKU"],
                sizeCode: data["Size"],
                barCode: data["Barcode"]
              };
              if (Object.keys(validateSku(skuObj)).length) error.push({
                Source: "SKU Upload",
                Row: results.length,
                Data: data,
                Error: validateSku(skuObj).error.errorCode
              });else if (!skuCodes.find(function (ele) {
                return ele.skuCode === skuObj.skuCode;
              })) skuCodes.push(skuObj);else error.push({
                Source: "SKU Upload",
                Row: results.length,
                Data: skuObj,
                Error: "Duplicate Sku"
              });
              var sizeObj = {
                clientId: clientId,
                sizeCode: data["Size"]
              }; // if (Object.keys(validateSize(sizeObj)).length)
              //     error.push({ rowNum: results.length, rowData: data, error: validateSku(sizeObj).error });
              // else 

              if (!sizeCodes.find(function (ele) {
                return ele.sizeCode === sizeObj.sizeCode;
              })) sizeCodes.push(sizeObj);
            }).on("end", function _callee() {
              var styleMaster, skuMaster, sizeMaster, StyleCodes, styles, SizeCodes, sizes, SkuCodes, skus, skuCodeInMongo;
              return regeneratorRuntime.async(function _callee$(_context2) {
                while (1) {
                  switch (_context2.prev = _context2.next) {
                    case 0:
                      _context2.prev = 0;
                      _context2.next = 3;
                      return regeneratorRuntime.awrap(Style.find({
                        clientId: clientId
                      }));

                    case 3:
                      styleMaster = _context2.sent;
                      _context2.next = 6;
                      return regeneratorRuntime.awrap(SkuMaster.find({
                        clientId: clientId
                      }));

                    case 6:
                      skuMaster = _context2.sent;
                      _context2.next = 9;
                      return regeneratorRuntime.awrap(SizeMaster.find({
                        clientId: clientId
                      }));

                    case 9:
                      sizeMaster = _context2.sent;
                      StyleCodes = removeDuplicates(styleCodes, styleMaster, false), styles = [];

                      if (StyleCodes.error.length) {
                        _context2.next = 18;
                        break;
                      }

                      StyleCodes = StyleCodes.master;
                      _context2.next = 15;
                      return regeneratorRuntime.awrap(Style.insertMany(StyleCodes));

                    case 15:
                      styles = _context2.sent;
                      _context2.next = 19;
                      break;

                    case 18:
                      StyleCodes = [];

                    case 19:
                      SizeCodes = removeDuplicates(sizeCodes, sizeMaster, false), sizes = [];

                      if (SizeCodes.error.length) {
                        _context2.next = 27;
                        break;
                      }

                      SizeCodes = SizeCodes.master;
                      _context2.next = 24;
                      return regeneratorRuntime.awrap(SizeMaster.insertMany(SizeCodes));

                    case 24:
                      sizes = _context2.sent;
                      _context2.next = 28;
                      break;

                    case 27:
                      SizeCodes = [];

                    case 28:
                      SkuCodes = removeDuplicates(skuCodes, skuMaster, true), skus = [], skuCodeInMongo = false;

                      if (SkuCodes.error.length) {
                        _context2.next = 36;
                        break;
                      }

                      SkuCodes = SkuCodes.master;
                      _context2.next = 33;
                      return regeneratorRuntime.awrap(SkuMaster.insertMany(SkuCodes));

                    case 33:
                      skus = _context2.sent;
                      _context2.next = 38;
                      break;

                    case 36:
                      SkuCodes = [];
                      skuCodeInMongo = true;

                    case 38:
                      if (error.length) {
                        exportCsv(res, error);
                      } else res.json({
                        data: {
                          styleCodes: styles,
                          skuCodes: skus,
                          sizeCode: sizes
                        },
                        error: {
                          inValid: error,
                          duplicate_Sku_In_File: duplicateSku,
                          duplicate_Sku_In_DB: skuCodeInMongo ? SkuCodes : "None"
                        }
                      });

                      _context2.next = 44;
                      break;

                    case 41:
                      _context2.prev = 41;
                      _context2.t0 = _context2["catch"](0);
                      res.status(400).json({
                        message: _context2.t0
                      });

                    case 44:
                    case "end":
                      return _context2.stop();
                  }
                }
              }, null, null, [[0, 41]]);
            });
          } else res.status(400).json({
            error: "No FileFound!!"
          });

          _context3.next = 13;
          break;

        case 10:
          _context3.prev = 10;
          _context3.t0 = _context3["catch"](0);
          res.status(400).json({
            message: _context3.t0
          });

        case 13:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[0, 10]]);
});
module.exports = router;