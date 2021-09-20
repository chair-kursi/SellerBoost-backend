const express = require('express');
const router = express.Router();
const SkuMaster = require('../models/SkuMaster');
const { getClientId } = require('../services/getClientId');
const { validateSku } = require('../validators/skusValidators');


const clientId = getClientId(); //sir as we are getting clientId from a func, is it OK to invoke getClientId() just once here??

const notClientIdAndSkuCode = (skuCode, clientId) => {

    return {
        errorCode: "GenEx",
        httpStatus: 400,
        locator: [{
            id: "SkuCode",
            message: `No sku found with SkuCode: ${skuCode} & ClientId: ${clientId}`
        }],
        internalMessage: "Validation Err",
        timeStamp: Date().toString()
    }
}


//GET ALL SKUS
router.get('/', async (req, res) => {
    try {
        const sku = await SkuMaster.find({ clientId: clientId })
        res.json(sku);
    } catch (err) {
        res.json({ message: err });
    }
})


//GET SPECIFIC SKU
router.get('/:skuCode', async (req, res) => {
    try {
        const sku = await SkuMaster.find({ skuCode: req.params.skuCode, clientId: clientId })
        res.json(sku);
    } catch (err) {
        res.json({ message: err });
    }
})

//CREATE NEW SKU
router.post('/add', async (req, res) => {

    if (Object.keys(validateSku(req)).length)
    return res.status(400).json(validateSku(req));
    
    try {
        const sku = new SkuMaster(req.body);
        
        console.log("req.body1", sku);
        const savedSku = await sku.save();
        res.json({ data: savedSku, error: {} });
        console.log("req.body2", req.body);
        
    } catch (err) {
        res.json({ message: err })
    }
})


//UPDATING A SKU
router.patch('/update/:skuCode', async (req, res) => {

    if (Object.keys(validateSku(req)).length)
        return res.status(400).json(validateSku(req));

    const sku = await SkuMaster.findOne({ clientId: clientId, skuCode: req.params.skuCode });
    if (!sku)
        return res.status(400).json({
            data: null,
            error: notClientIdAndSkuCode(req.params.SkuMaster, clientId)
        });



    try {
        const updatedSku = await SkuMaster.findOneAndUpdate({ skuCode: req.params.skuCode }, req.body);
        res.json({ data: updatedSku, error: {} });
    } catch (err) {
        res.json({ message: err });
    }

})


module.exports = router;