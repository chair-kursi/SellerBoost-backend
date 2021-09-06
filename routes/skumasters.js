const express = require('express');
const router = express.Router();
const SkuMaster = require('../models/SkuMaster')

router.get('/', (req, res) => {
    res.send("success")
})
 

module.exports = router; 