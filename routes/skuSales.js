const express = require("express");
const router = express.Router();
const SkuSales = require("../models/SkuSales");
const csvParser = require("csv-parser");
var https = require('https');

const fs = require("fs");

router.post("/skuSales", (req, res) => {
  const results = [];
  var download = function (url, dest, cb) {
    var file = fs.createWriteStream(dest);
    https.get(url, function (response) {
      response.pipe(file);
      file.on('finish', function () {
        fs.createReadStream(dest)
          .pipe(csvParser({}))
          .on("data", (data) => {

            let obj = {
               
            }
            results.push(data);
          })
          .on("end", async () => {
            try {
              // const result = await SkuSales.insertMany(results);
              // res.json(result);
              res.json(results);
            } catch (err) {
              res.json({ message: err });
            }
          });
      });
    });
  }
  download(req.body.fileUrl, "csvFiles/" + Date.now() + "CSV")

});

module.exports = router;
