const express = require('express');
const router = express.Router();
const Style = require('../models/Style')

router.get('/', async(req, res) => {
    try{
        const style = await Style.find()
        res.json(style)
    }catch(err){
        res.json({message: err})
    }
})

router.get('/:styleId', async(req, res) => {
    try{
        const style = await Style.find({_id: req.params.styleId})
        res.json(style)
    }catch(err){
        res.json({message: err})
    }
})

router.post('/', async (req, res) => {
    const style = new Style({
        styleCode: req.body.styleCode,
        frontImgUrl: req.body.frontImg,
        backImgUrl: req.body.backImg,
        zoomImgUrl: req.body.zoomImg,
        color: req.body.color,
        name: req.body.name
    })
    try { 
        const savedStyle = await style.save();
        res.json(savedStyle); 
    } catch (err) {
        res.json({ message: err })
    }
})

module.exports = router;
