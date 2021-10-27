"use strict";

var express = require("express");

var https = require("https");

var router = express.Router();

var Inventory = require("../models/Inventory");

var csvParser = require("csv-parser");

var multer = require("multer");

var fs = require("fs");

var Client = require("../models/Client");

var fileStorageEngine = multer.diskStorage({
  destination: function destination(res, file, cb) {
    cb(null, "./csvFiles");
  },
  filename: function filename(req, file, cb) {
    cb(null, "INVENTORY-" + Date.now() + "__" + file.originalname);
  }
});
var upload = multer({
  storage: fileStorageEngine
});

var createInventoryObj = function createInventoryObj(clientId, data) {
  var obj = {
    clientId: clientId,
    facility: data["Facility"],
    itemTypeName: data["Item Type Name"],
    itemSkuCode: data["Item SkuCode"],
    EAN: data["EAN"],
    UPC: data["UPC"],
    ISBN: data["ISBN"],
    color: data["Color"],
    size: data["Size"],
    brand: data["Brand"],
    categoryName: data["Category Name"],
    MRP: data["MRP"],
    openSale: data["Open Sale"],
    inventory: data["Inventory"],
    inventoryBlocked: data["Inventory Blocked"],
    badInventory: data["Bad Inventory"],
    putawayPending: data["Putaway Pending"],
    pendingInventoryAssessment: data["Pending Inventory Assessment"],
    stockInTransfer: data["Stock In Transfer"],
    openPurchase: data["Open Purchase"],
    enabled: data["Enabled"],
    costPrice: data["Cost Price"]
  };
  return obj;
};

var saveFileOfInventory = function saveFileOfInventory(res, destination, clientId) {
  var results;
  return regeneratorRuntime.async(function saveFileOfInventory$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          results = [];
          fs.createReadStream(destination).pipe(csvParser({})).on("data", function (data) {
            var obj = createInventoryObj(clientId, data);
            results.push(obj);
          }).on("end", function _callee() {
            var result;
            return regeneratorRuntime.async(function _callee$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    _context.prev = 0;
                    _context.next = 3;
                    return regeneratorRuntime.awrap(Inventory.insertMany(results));

                  case 3:
                    result = _context.sent;
                    res.json(result);
                    _context.next = 11;
                    break;

                  case 7:
                    _context.prev = 7;
                    _context.t0 = _context["catch"](0);
                    console.error("ERROR saving files in DB");
                    res.json({
                      message: _context.t0
                    });

                  case 11:
                  case "end":
                    return _context.stop();
                }
              }
            }, null, null, [[0, 7]]);
          });

        case 2:
        case "end":
          return _context2.stop();
      }
    }
  });
};

router.post("/skuInventory", upload.single("csvFile"), function _callee2(req, res) {
  var results, localId, client, clientId, download;
  return regeneratorRuntime.async(function _callee2$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          results = [];
          localId = req.cookies.LocalId;
          _context3.next = 4;
          return regeneratorRuntime.awrap(Client.findOne({
            password: localId
          }));

        case 4:
          client = _context3.sent;
          clientId = client.clientId;

          if (req.body.fileUrl) {
            download = function download(url, dest) {
              var file = fs.createWriteStream(dest);
              https.get(url, function (response) {
                response.pipe(file);
                file.on('finish', function () {
                  saveFileOfInventory(res, dest, clientId);
                });
              });
            };

            download(req.body.fileUrl, "csvFiles/INVENTORY" + Date.now());
          } else if (req.file && req.file.path) {
            saveFileOfInventory(res, req.file.path, clientId);
          }

        case 7:
        case "end":
          return _context3.stop();
      }
    }
  });
});
router.get("/skuInventory", function _callee3(req, res) {
  var localId, client, _clientId, inventory;

  return regeneratorRuntime.async(function _callee3$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.prev = 0;
          localId = req.cookies.LocalId;
          _context4.next = 4;
          return regeneratorRuntime.awrap(Client.findOne({
            password: localId
          }));

        case 4:
          client = _context4.sent;
          _clientId = client.clientId;
          _context4.next = 8;
          return regeneratorRuntime.awrap(Inventory.find({
            clientId: _clientId
          }));

        case 8:
          inventory = _context4.sent;
          res.json({
            data: inventory,
            error: null
          });
          _context4.next = 15;
          break;

        case 12:
          _context4.prev = 12;
          _context4.t0 = _context4["catch"](0);
          res.status(400).json({
            message: _context4.t0
          });

        case 15:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[0, 12]]);
});
module.exports = router;