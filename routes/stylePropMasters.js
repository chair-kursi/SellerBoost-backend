const express = require('express');
const router = express.Router();
const StylePropMaster = require('../models/StylePropMaster')

router.get('/', (req, res) => {
    res.send("success")
})
 

module.exports = router; 