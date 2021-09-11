const express = require('express');
const router = express.Router();
const Style = require('../models/Style');
const { successStyleResponse, errorStyleResponse, validateStyle } = require('../validators/stylesValidator');
const { getClientId } = require('../services/getClientId')


const clientId = getClientId(); //sir as we are getting clientId from a func, is it OK to invoke getClientId() just once here??

const notClientIdAndStyleCode = (styleCode, clientId) => {

    return {
        errorCode: "GenEx",
        httpStatus: 400,
        locator: [{
            id: "StyleCode",
            message: `No style found with StyleCode: ${styleCode} & ClientId: ${clientId}`
        }],
        internalMessage: "Validation Err",
        timeStamp: Date().toString()
    }
}

//GETTING ALL STYLES
router.get('/', async (req, res) => {
    try {  
        const style = await Style.find({ clientId: clientId });
        res.json(style);

    } catch (err) {
        res.json({ message: err });
    }
})

//GETTING A SPECIFIC STYLE
router.get('/:styleCode', async (req, res) => {
    try {
        const style = await Style.find({ styleCode: req.params.styleCode, clientId: clientId });
        res.json(style);
    } catch (err) {
        res.json({ message: err });
    }
})


//ADDING A NEW STYLE
router.post('/add', async (req, res) => {

    if (req.body.styleCode === "SB-11")
        return successStyleResponse(res);
    else if (req.body.styleCode === "SB-00")
        return errorStyleResponse(res);

    //VALIDATING REQUEST
    const style = new Style(req.body);

    if (Object.keys(validateStyle(req)).length) {
        return res.status(400).json(validateStyle(req));
    }

    try {
        const savedStyle = await style.save();

        res.status(200).json({ data: savedStyle, error: {} });

    } catch (err) {
        res.json({ message: err });
    }
})



//UPDATING A STYLE
router.patch('/update/:styleCode', async (req, res) => {//REMEMBER TO SEND REQUEST OF ONLY UPDATED/CHANGED FIELDS

    //VALIDATING REQUEST 
    if (Object.keys(validateStyle(req)).length) {
        return res.status(400).json(validateStyle(req));
    }

    const style = await Style.findOne({ clientId: clientId, styleCode: req.params.styleCode });

    if (!style)
        return res.status(400).json({
            data: null,
            error: notClientIdAndStyleCode(req.params.styleCode, clientId)
        })

    try {
        const updatedStyle = await Style.findOneAndUpdate({ styleCode: req.params.styleCode },
            req.body,
            {
                new: true
            });
        res.json({ data: updatedStyle, error: {} });//REQ.BODY DOESN'T INCLUDES STYLE CODE, TO INCLUDE IT, WE HAVE TO MAKE ONE MORE API CALL

    } catch (err) {
        res.json({ message: err });
    }

})

module.exports = router;