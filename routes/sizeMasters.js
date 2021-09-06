const express = require('express');
const router = express.Router();
const SizeMaster = require('../models/SizeMaster')

router.get('/', (req, res) => {
    res.send("success")
})
 

module.exports = router; 