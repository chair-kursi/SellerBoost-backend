const { application } = require('express');
const express = require('express');
const router = express.Router();
const SkuTraffic = require('../models/SkuTrafficMongo');


const clientId = getClientId(); //sir as we are getting clientId from a func, is it OK to invoke getClientId() just once here??


router.post("/")


module.exports = router;