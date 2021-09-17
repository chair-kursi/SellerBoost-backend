const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory')
const csvParser = require("csv-parser");


const fs = require("fs");
const results = [];



router.post('/upload-inventory', (req, res) => {
    fs.createReadStream("sample.csv")
    .pipe(csvParser({}))
    .on("data", (data) => results.push(data))
    .on('end', async () => {
        try{const result  = await Inventory.insertMany(results);
        console.log(result);
        res.json(result);}
        catch(err){
            res.json({message: err});
        }
    })
    
})


module.exports = router;
