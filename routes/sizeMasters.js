const express = require('express');
const router = express.Router();
const SizeMaster = require('../models/SizeMaster');
const { validateSize } = require('../validators/sizesValidators');
const { getClientId } = require('../services/getClientId');


// const clientId = getClientId();

const notClientIdAndSizeCode = (sizeCode, clientId) => {
    return {
        errorCode: "GenEx",
        httpStatus: 400,
        locator: [{
            id: "SizeCode",
            message: `No size found with SizeCode: ${sizeCode} & ClientId: ${clientId}`
        }],
        internalMessage: "Validation Err",
        timeStamp: Date().toString()
    };
}


//GET ALL SIZES
router.get('/', async (req, res) => {
    try {
        const clientId = getClientId();
        const sizes = await SizeMaster.find({ clientId: clientId })
        res.json(sizes);
    } catch (err) {
        res.json({ message: err });
    }
})


//GET SPECIFIC SIZE
router.get('/:sizeCode', async (req, res) => {
    try {
        const clientId = getClientId();
        const size = await SizeMaster.findOne({ sizeCode: req.params.sizeCode, clientId: clientId })
        res.json(size);
    } catch (err) {
        res.json({ message: err });
    }
})

//CREATE NEW SIZE
router.post('/add', async (req, res) => {

    if (Object.keys(validateSize(req)).length)
        return res.status(400).json(validateSize(req));

    try {
        const clientId = getClientId();
        const size = new SizeMaster(req.body);
        const savedSize = await size.save();

        res.json({ data: savedSize, error: {} });

    } catch (err) {
        res.json({ message: err });
    }
})


//UPDATING A SIZE
router.patch('/update/:sizeCode', async (req, res) => {

    //VALIDATING REQUESTS
    if (Object.keys(validateSize(req)).length)
        return res.status(400).json(validateSize(req));

    //VALIDATING SIZECODE WITH CLIENT_ID
    const clientId = getClientId();
    const size = await SizeMaster.findOne({ clientId: clientId, sizeCode: req.params.sizeCode })
    if (!size)//SIZE == NULL
        return res.status(400).json({
            data: null,
            error: notClientIdAndSizeCode(req.params.sizeCode, clientId)
        });



    try {
        const updatedSize = await SizeMaster.findOneAndUpdate({ sizeCode: req.params.sizeCode }, req.body);
        res.json({ data: updatedSize, error: {} });
    } catch (err) {
        res.json({ message: err });
    }

})


module.exports = router;