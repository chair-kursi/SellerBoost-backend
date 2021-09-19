const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory')
const csvParser = require("csv-parser");
const multer = require("multer");


const fileStorageEngine = multer.diskStorage({
    destination: (res, file, cb) => {
        cb(null, "./csvFiles");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + file.originalname);
    }
})

const upload = multer({ storage: fileStorageEngine })

router.post("/uploadinventory", async (req, res) => {
    console.log("req.files", req.files)
})


const fs = require("fs");
const results = [];


router.post('/upload-inventory', upload.single('csvFile'), (req, res) => { 
    // console.log(req.file);
    fs.createReadStream("csvFiles/"+req.file.filename)
        .pipe(csvParser({}))
        .on("data", (data) => results.push(data))
        .on('end', async () => {
            try {
                // console.log(results);
                const result = await Inventory.insertMany(results);
                // console.log(result);
                res.json(results);
            }
            catch (err) {
                res.json({ message: err });
            }
        })
})


module.exports = router; 