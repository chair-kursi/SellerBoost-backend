const express = require('express');
const router = express.Router();
const Client = require('../models/Client')


router.post("/clientId", async (req, res) => {
    try {
        let obj = {};
        if (req.cookies.LocalId === "RvvwQ2XVc7hPHCDIfTDO8qnb4c83") {

            obj = {
                clientId: "StyloBug",
                name: "Stylo Bug",
                email: "abc@123.com",
                mobile: 8474837412,
                emailVerified: false,
                mobileVerified: false,
                password: "RvvwQ2XVc7hPHCDIfTDO8qnb4c83"
            }
        }
        if (req.cookies.LocalId === "6N9yuxkxf6MhmSdOZuvAuze3l943") {

            obj = {
                clientId: "Yuvdhi",
                name: "Yuvdhi",
                email: "satpal@yuvdhi.com",
                mobile: 8474837422,
                emailVerified: false,
                mobileVerified: false,
                password: "6N9yuxkxf6MhmSdOZuvAuze3l943"
            }
        } 
        const client = new Client(obj);
        const savedClient = await client.save();
        res.json(savedClient);

    } catch (err) {
        if (err)
            res.status(400).json({ message: err });
        res.json({ message: err });
    }
})


router.get("/clientId", async (req, res) => {
    try {
        // console.log(req.cookies); 
        res.json({cookies: req.cookies.LocalId});
    } catch (err) {
        if (err)
            res.status(400).json({ message: err });
        res.json({ message: err });
    }
})

module.exports = router;