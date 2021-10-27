const express = require('express');
const Client = require('../models/Client');
const router = express.Router();
const SkuTraffic = require('../models/SkuTrafficMongo'); 


router.get("/skuTraffic", async (req, res) => {
    try {
        var localId = req.cookies.LocalId;
        const client = await Client.findOne({ password: localId });
        const clientId = client.clientId;

        const skuTraffic = await SkuTraffic.find({ clientId: clientId });
        res.json({ data: skuTraffic, error: null });
    }
    catch (err) {
        res.status(400).json({ message: err });
    }
})


module.exports = router;