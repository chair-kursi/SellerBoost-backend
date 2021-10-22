const express = require("express");
const router = express.Router();
const SkuSales = require("../models/SkuSales");
const csvParser = require("csv-parser");
var https = require('https');
const multer = require("multer");
const fs = require("fs");
const MarketplaceHealth = require("../models/MarketplaceHealth");


const fileStorageEngine = multer.diskStorage({
  destination: (res, file, cb) => {
    cb(null, "./csvFiles");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "__" + file.originalname);
  },
});

const upload = multer({ storage: fileStorageEngine });


router.post("/skuSales", upload.single("csvFile"), (req, res) => {
  const results = [];
  var download = function (url, dest) {
    var file = fs.createWriteStream(dest);
    https.get(url, function (response) {
      response.pipe(file);
      file.on('finish', function () {
        fs.createReadStream(dest)
          .pipe(csvParser({}))
          .on("data", (data) => {
            let obj = {
              skuCode: data["Sku Code"],
              name: data["Name"],
              inventory: data["Inventory"],
              totalSales: data["Total Sales"],
              dayOfInventory: data["Day Of Inventory"]
            }
            results.push(obj);
          })
          .on("end", async () => {
            try {
              const result = await SkuSales.insertMany(results);
              res.json(result);
              fs.unlink(dest, (err) => {//deleting created file
                if (err) throw err;
                console.log("deleted");
              });
            } catch (err) {
              res.json({ message: err });
            }
          });
      });
    });
  }
  if (req.body.fileUrl) {
    download(req.body.fileUrl, "csvFiles/SKUSALES" + Date.now())
  }
  else if (req.file && req.file.path) {
    fs.createReadStream(req.file.path)
      .pipe(csvParser({}))
      .on("data", (data) => {
        results.push(data);
      })
      .on("end", async () => {
        try {
          const result = await SkuSales.insertMany(results);
          res.json(result);
          // res.json(results); 
        } catch (err) {
          res.json({ message: err });
        }
      });
  }
  else res.send("Nothing")
});

router.post("/skuSales", async (req, res) => {
  try {
    const skuSales = await SkuSales.find({});
    res.json({ data: skuSales, error: null });
  } catch (err) {
    res.status(400).json({ message: err });
  }
})  

module.exports = router;
