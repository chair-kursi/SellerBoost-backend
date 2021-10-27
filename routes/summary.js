const express = require('express');
const Client = require('../models/Client');
const router = express.Router();
const Summary = require('../models/Summary');


// const clientId = getClientId(); //sir as we are getting clientId from a func, is it OK to invoke getClientId() just once here??


router.get("/summaryForHome", async(req, res)=>{
    try{
        var localId = req.cookies.LocalId; 
        // if(!localId)
        // localId="6N9yuxkxf6MhmSdOZuvAuze3l943";
        
        const client = await Client.findOne({ password: localId });
        const clientId = client.clientId; 
        
        const summary = await Summary.find({clientId: clientId});
        res.json({data: summary, error: null});
    }
    catch(err){
        res.status(400).json({message: err});
    }
})


module.exports = router;