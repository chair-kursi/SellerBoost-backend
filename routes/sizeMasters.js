const express = require('express');
const router = express.Router();
const SizeMaster = require('../models/SizeMaster');
const sizes = require('../validators/sizes');


//GET ALL SIZES
router.get('/', async (req, res) => {
    try {
        const style = await SizeMaster.find()
        res.json(style)
    } catch (err) {
        res.json({ message: err })
    }
})


//GET SPECIFIC SIZE
router.get('/:sizeCode', async (req, res) => {
    try {
        const size = await SizeMaster.find({ sizeCode: req.params.sizeCode })
        res.json(size)
    } catch (err) {
        res.json({ message: err })
    }
})

//CREATE NEW SIZE
router.post('/add', async (req, res) => {

    const validateSize = sizes.validateSize(req);
    if (Object.keys(validateSize).length)
        return res.status(400).json(validateSize);

    try {
        const size = new SizeMaster(req.body);

        const savedSize = await size.save();
        res.json({ data: savedSize, error: {} })

    } catch (err) {
        res.json({ message: err })
    }
})


//UPDATING A SIZE
router.patch('/update/:sizeCode', async (req, res) => {

    const validateSize = sizes.validateSize(req);
    if (Object.keys(validateSize).length)
        return res.status(400).json(validateSize);

    try {
        const updatedSize = await SizeMaster.findOneAndUpdate({ styleCode: req.params.sizeCode }, req.body);
        res.json({ data: updatedSize, error: {} })
    } catch (err) {
        res.json({ message: err })
    }

})


module.exports = router;