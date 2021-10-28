const express = require('express');
const SizeMaster = require('../models/SizeMaster');
const SkuMaster = require('../models/SkuMaster');
const Style = require('../models/Style');
const { validateSize } = require('../validators/sizesValidators');
const { validateSku } = require('../validators/skusValidators');
const { validateStyle } = require('../validators/stylesValidator');
const router = express.Router();
const csvParser = require("csv-parser");
const multer = require("multer");
const fs = require("fs");
const Client = require('../models/Client');
const { Parser } = require('json2csv');

const removeDuplicates = (master, masterInMongo, throwErr) => {
    try {
        const masterData = [], error = [];

        for (var i = 0; i < master.length; i++) {
            // console.log(i, master[i]);
            //FOR STYLECODES
            let obj = {};
            if (master[i].styleCode && !masterInMongo.find((ele) => { return ele.styleCode === master[i].styleCode })) {
                obj = master[i];
            }


            //FOR SKUCODES
            if (master[i].skuCode && !masterInMongo.find((ele) => { return ele.skuCode === master[i].skuCode })) {
                obj = master[i];
            }
            else if (master[i].skuCode && throwErr)
                error.push({Source:"SKU Upload", Data: master[i], Row: i + 1, Error :"SKU Already Uploaded" });

            //FOR SIZECODES
            if (master[i].sizeCode && !masterInMongo.find((ele) => { return ele.sizeCode === master[i].sizeCode })) {
                obj = master[i];
            }

            if (Object.keys(obj).length)
                masterData.push(obj);
        }
        return {
            error: error,
            master: masterData
        }
    } catch (err) {
        res.status(404).json({ message: err })
    }
}
//MULTER START
const fileStorageEngine = multer.diskStorage({
    destination: (res, file, cb) => {
        cb(null, "./csvFiles");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "__" + file.originalname);
    },
});

const upload = multer({ storage: fileStorageEngine });
//MULTER END

const exportCsv = async (res, json) => {
    const fields = ["Source", "Row", "Data", "Error"];
    const opts = { fields };
    try {
        const parser = new Parser(opts);
        const csv = parser.parse(json);
        const destination = "csvFiles/SetUpError" + Date.now()+".csv";
        fs.writeFile(destination, csv, function (err) {
            if (err)
                throw err;
            res.set('Content-Type', 'application/csv');
            res.download(destination); 
        }); 
    } catch (err) {
        console.error(err);
    }
}

router.post('/setUp', upload.single("csvFile"), async (req, res) => {
    try {

        var localId = req.cookies.LocalId;
        // if(!localId)
        // localId="6N9yuxkxf6MhmSdOZuvAuze3l943";

        const client = await Client.findOne({ password: localId });
        const clientId = client.clientId;

        //DELETING FOR TESTING
        // await SkuMaster.deleteMany({ clientId: clientId });
        // await Style.deleteMany({ clientId: clientId });
        // res.send("OK Deleted SKUS");

        const error = [], styleCodes = [], sizeCodes = [], skuCodes = [], duplicateSku = [], results = [];
        if (req.file && req.file.path) {
            fs.createReadStream(req.file.path)
                .pipe(csvParser({}))
                .on("data", (data) => {
                    results.push(data);
                    // const errorStatus = [];
                    let styleObj = {
                        clientId: clientId,
                        status: null,
                        styleCode: data["Style Code"],
                        frontImageUrl: data['Front Image Url']
                    }

                    // if (Object.keys(validateStyle(styleObj)).length)
                    //     {
                    //         error.push({ Source: "SKU Upload",Row: results.length, Data: data, error: validateStyle(styleObj).error.errorCode });
                    //         errorStatus.push(styleObj.styleCode);
                    // }
                    // if (Object.keys(validateStyle(styleObj)).length) {
                    //     error.push({ Source: "SKU Upload", Row: results.length, Data: data, error: validateStyle(styleObj).error.errorCode });
                    //     errorStatus.push(styleObj.styleCode);
                    // }
                    // else 
                    if (!styleCodes.find((ele) => { return ele.styleCode === styleObj.styleCode }))
                        styleCodes.push(styleObj);

                    let skuObj = {
                        clientId: clientId,
                        styleCode: data["Style Code"],
                        skuCode: data["SKU"],
                        sizeCode: data["Size"],
                        barCode: data["Barcode"]
                    }

                    if (Object.keys(validateSku(skuObj)).length)
                        error.push({ Source: "SKU Upload", Row: results.length, Data: data, Error: validateSku(skuObj).error.errorCode });
                    else if (!skuCodes.find((ele) => { return ele.skuCode === skuObj.skuCode }))
                        skuCodes.push(skuObj);
                    else error.push({ Source: "SKU Upload", Row: results.length, Data: skuObj, Error: "Duplicate Sku" });

                    let sizeObj = {
                        clientId: clientId,
                        sizeCode: data["Size"]
                    }

                    // if (Object.keys(validateSize(sizeObj)).length)
                    //     error.push({ rowNum: results.length, rowData: data, error: validateSku(sizeObj).error });
                    // else 
                    if (!sizeCodes.find((ele) => { return ele.sizeCode === sizeObj.sizeCode }))
                        sizeCodes.push(sizeObj);
                })
                .on("end", async () => {
                    try {
                        const styleMaster = await Style.find({ clientId: clientId });
                        const skuMaster = await SkuMaster.find({ clientId: clientId });
                        const sizeMaster = await SizeMaster.find({ clientId: clientId });


                        var StyleCodes = removeDuplicates(styleCodes, styleMaster, false), styles = [];
                        if (!StyleCodes.error.length) {
                            StyleCodes = StyleCodes.master;
                            styles = await Style.insertMany(StyleCodes);
                        }
                        else StyleCodes = [];

                        var SizeCodes = removeDuplicates(sizeCodes, sizeMaster, false), sizes = [];
                        if (!SizeCodes.error.length) {
                            SizeCodes = SizeCodes.master;
                            sizes = await SizeMaster.insertMany(SizeCodes);
                        } else SizeCodes = [];


                        var SkuCodes = removeDuplicates(skuCodes, skuMaster, true), skus = [], skuCodeInMongo = false;
                        if (!SkuCodes.error.length) {
                            SkuCodes = SkuCodes.master;
                            skus = await SkuMaster.insertMany(SkuCodes);
                        }
                        else {
                            SkuCodes = [];
                            skuCodeInMongo = true;
                        }
                        if(error.length){
                            exportCsv(res, error);
                        }

                        else res.json({
                            data: {
                                styleCodes: styles,
                                skuCodes: skus,
                                sizeCode: sizes,
                            },
                            error: {
                                inValid: error,
                                duplicate_Sku_In_File: duplicateSku,
                                duplicate_Sku_In_DB: (skuCodeInMongo ? SkuCodes : "None")

                            }
                        })
                    } catch (err) {
                        res.status(400).json({ message: err });
                    }
                });
        }
        else res.status(400).json({ error: "No FileFound!!" });
    } catch (err) {
        res.status(400).json({ message: err });
    }
})



module.exports = router;