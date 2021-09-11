const express = require('express');
const { check } = require('express-validator');
const router = express.Router();
const Style = require('../models/Style');
const styles = require('../validators/styles'); 


//GETTING ALL STYLES
router.get('/', async (req, res) => {
    try {
        const style = await Style.find()
        res.json(style)
    } catch (err) {
        res.json({ message: err })
    }
})

//GETTING A SPECIFIC STYLE
router.get('/:styleId', async (req, res) => {
    try {
        const style = await Style.find({ _id: req.params.styleId })
        res.json(style)
    } catch (err) {
        res.json({ message: err })
    }
})


//ADDING A NEW STYLE
router.post('/add', async (req, res) => {

    if (req.body.styleCode === "SB-11")
        return styles.successStyleResponse(res)
    else if (req.body.styleCode === "SB-00")
        return styles.errorStyleResponse(res)

    //VALIDATING REQUEST
    const style = new Style(req.body);
    const validateStyle = styles.validateStyle(req);

    if (Object.keys(validateStyle).length) {
        return res.status(400).json(validateStyle);
    }

    try {
        const savedStyle = await style.save();

        res.status(200).json({ data: savedStyle, error: {} });

    } catch (err) {
        res.json({ message: err })
    }
})



//UPDATING A STYLE
router.patch('/update/:styleCode', async (req, res) => {//REMEMBER TO SEND REQUEST OF ONLY UPDATED/CHANGED FIELDS
    
    //VALIDATING REQUEST
    const validateStyle = styles.validateStyle(req);
    if (Object.keys(validateStyle).length) {
        return res.status(400).json(validateStyle);
    }


    try {
        const updatedStyle = await Style.findOneAndUpdate({ styleCode: req.params.styleCode },//findByIdAndUpdate()
            req.body,
            {
                new: true
            })
        res.json({ data: updatedStyle, error: {}})//REQ.BODY DOESN'T INCLUDES STYLE CODE, TO INCLUDE IT, WE HAVE TO MAKE ONE MORE API CALL

    } catch (err) {
        res.json({ message: err })
    }

})

module.exports = router;