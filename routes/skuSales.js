const express = require("express");
const router = express.Router();
const SkuSales = require("../models/SkuSales");
const csvParser = require("csv-parser");
const multer = require("multer");

const fileStorageEngine = multer.diskStorage({
  destination: (res, file, cb) => {
    cb(null, "./csvFiles");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "__" + file.originalname);
  },
});

const upload = multer({ storage: fileStorageEngine });

const fs = require("fs");
const results = [];

router.post("/skuSales", upload.single("csvFile"), (req, res) => {
  console.log(req.file.path);
  fs.createReadStream(req.file.path)
    .pipe(csvParser({}))
    .on("data", (data) => results.push(data))
    .on("end", async () => {
      try {
        const result = await SkuSales.insertMany(results);
        // console.log(result);
        res.json(result);
      } catch (err) {
        res.json({ message: err });
      }
    });
});

module.exports = router;
