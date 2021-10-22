const express = require('express');
const router = express.Router();
const Client = require('../models/Client')


router.post("/clientId", async (req, res) => {
    try {
        let obj = {};
        if (req.body.localId === "RvvwQ2XVc7hPHCDIfTDO8qnb4c83") {

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
        console.log(req.cookies);
        global.clientId = await Client.findOne({password: req.cookies.LocalId});
        console.log(clientId);
        res.send(clientId);
    } catch (err) {
        if (err)
            res.status(400).json({ message: err });
        res.json({ message: err });
    }
})

module.exports = router;