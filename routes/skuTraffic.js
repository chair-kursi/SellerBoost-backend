const express = require('express');
const router = express.Router();
const SkuTraffic = require('../models/SkuTrafficMongo');


const clientId = getClientId(); //sir as we are getting clientId from a func, is it OK to invoke getClientId() just once here??


router.get("/skuTraffic", async(req, res)=>{
    try{
        const skuTraffic = await SkuTraffic.find({clientID: clientId});
        res.json({data: skuTraffic, error: null});
    }
    catch(err){
        res.status(400).json({message: err});
    }
})


module.exports = router;