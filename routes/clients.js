const express = require('express');
const router = express.Router();
const Client = require('../models/Client')

const createClientObj = (clientId, name, email, mobile, emailVerified, mobileVerified, password) => {
    obj = {
        clientId: clientId,
        name: name,
        email: email,
        mobile: mobile,
        emailVerified: emailVerified,
        mobileVerified: mobileVerified,
        password: password
    };
    return obj;
}

router.post("/clientId", async (req, res) => {
    try {
        let obj = {}, localId = req.cookies.LocalId;

        if (localId === "RvvwQ2XVc7hPHCDIfTDO8qnb4c83")
            obj = createClientObj("StyloBug", "Stylo Bug", "abc@123.com", 8474837412, false, false, "RvvwQ2XVc7hPHCDIfTDO8qnb4c83");

        if (localId === "6N9yuxkxf6MhmSdOZuvAuze3l943")
            obj = createClientObj("Yuvdhi", "Yuvdhi", "satpal@yuvdhi.com", 8474837422, false, false, "6N9yuxkxf6MhmSdOZuvAuze3l943");

        console.log("/clientId: " + localId);
        
        const client = new Client(obj);
        const savedClient = await client.save();
        res.json(savedClient);

    } catch (err) {
        console.log("/clientId error " + err);
        res.status(400).json({ message: err });
    }
})


router.get("/clientId", async (req, res) => {
    try {
        // console.log(req.cookies); 
        res.json({ cookies: req.cookies.LocalId || "no cookies" });
    } catch (err) {
        if (err)
            res.status(400).json({ message: err });
        res.json({ message: err });
    }
})

module.exports = router;