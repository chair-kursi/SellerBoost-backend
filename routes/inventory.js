const express = require("express");
const https = require("https");
const router = express.Router();
const Inventory = require("../models/Inventory");
const csvParser = require("csv-parser");
const multer = require("multer");
const fs = require("fs");
const json2csv = require("json2csv");

const fileStorageEngine = multer.diskStorage({
  destination: (res, file, cb) => {
    cb(null, "./csvFiles");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "__" + file.originalname);
  },
});

const upload = multer({ storage: fileStorageEngine });


router.post("/skuInventory", upload.single("csvFile"), (req, res) => {
  const results = [];
  if (req.body.fileUrl) {
    var download = function (url, dest) {
      var file = fs.createWriteStream(dest);
      https.get(url, function (response) {
        response.pipe(file);
        file.on('finish', function () {
          fs.createReadStream(dest)
            .pipe(csvParser({}))
            .on("data", (data) => {
              let obj = {
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
                costPrice: data["Cost Price"],
              }
              results.push(obj);
            })
            .on("end", async () => {
              try {
                // const result = await Inventory.insertMany(results);
                var apiDataPull = Promise.resolve([
                  {
                    'day': '*date*',
                    'revenue': '*revenue value*'
                  }]).then(data => {
                    return json2csv.parseAsync(data, { fields: ['day', 'revenue', 'totalImpressions', 'eCPM'] })
                  }).then(csv => {
                    fs.writeFile('pubmaticData.csv', csv, function (err) {
                      if (err) throw err;
                      console.log('File Saved!')
                    });
                  });
                console.log(apiDataPull);
                // res.json(result);
              } catch (err) {
                res.json({ message: err });
              }
            });
        })
      })
    }
    download(req.body.fileUrl, "csvFiles/INVENTORY" + Date.now());
  }
  else if (req.file && req.file.path) {
    fs.createReadStream(req.file.path)
      .pipe(csvParser({}))
      .on("data", (data) => {
        let obj = {
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
          costPrice: data["Cost Price"],
        }
        results.push(obj);
      })
      .on("end", async () => {
        try {
          const result = await Inventory.insertMany(results);

          res.json(result);
        } catch (err) {
          res.json({ message: err });
        }
      });
  }
});

module.exports = router;
