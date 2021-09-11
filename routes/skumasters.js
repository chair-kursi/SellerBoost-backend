const express = require('express');
const router = express.Router();
const SkuMaster = require('../models/SkuMaster')
const skus = require("../validators/skus")

//GET ALL SKUS
router.get('/', async (req, res) => {
    try {
        const style = await SkuMaster.find()
        res.json(style)
    } catch (err) {
        res.json({ message: err })
    }
})


//GET SPECIFIC SKU
router.get('/:skuCode', async (req, res) => {
    try {
        const size = await SkuMaster.find({ sizeCode: req.params.skuCode })
        res.json(size)
    } catch (err) {
        res.json({ message: err })
    }
})

//CREATE NEW SKU
router.post('/add', async (req, res) => {

    const validateSku = skus.validateSku(req);
    if (Object.keys(validateSku).length)
        return res.status(400).json(validateSku);

    try {
        const size = new SkuMaster(req.body);

        const savedSize = await size.save();
        res.json({ data: savedSize, error: {} })

    } catch (err) {
        res.json({ message: err })
    }
})


//UPDATING A SKU
router.patch('/update/:sizeCode', async (req, res) => {

    const validateSku = skus.validateSku(req);
    if (Object.keys(validateSku).length)
        return res.status(400).json(validateSku);

    try {
        const updatedSize = await SkuMaster.findOneAndUpdate({ styleCode: req.params.sizeCode }, req.body);
        res.json({ data: updatedSize, error: {} })
    } catch (err) {
        res.json({ message: err })
    }

})


module.exports = router;