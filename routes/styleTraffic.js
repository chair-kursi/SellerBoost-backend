const express = require("express");
const router = express.Router();
const StyleTraffic = require("../models/StyleTraffic");
const SkuSales = require("../models/SkuSales");
const SkuMaster = require('../models/SkuMaster');
const Inventory = require("../models/Inventory");
const SkuTrafficMongo = require("../models/SkuTrafficMongo");
const { Parser } = require("json2csv");
const fs = require("fs");
const Style = require("../models/Style");
const Summary = require("../models/Summary");
var https = require('https');
const multer = require("multer");
const csvParser = require("csv-parser");
const Client = require("../models/Client");

//DEFINING CONSTATNTS
const inventoryValues = ["", 0, 10, 15, 50, 80, 150, 200, 300]; //"" at index zero is for completing the table
const dayInventoryValues = [0, 5, 15, 30, 45, 65];
const colorArr = ["SOLDOUT", "RED", "RED", "ORANGE", "GREEN", "OVERGREEN"];

const defaultTrafficColors = ["SOLDOUT", "RED", "ORANGE", "GREEN", "OVERGREEN"];

const styleCodeArr = []; //for storing unique styleCodes

const getTrafficColorArr = () => {

    let trafficColorArr = [];
    trafficColorArr.push(inventoryValues);

    for (var i = 0; i < dayInventoryValues.length; i++) {
        var tempArr = [];
        tempArr.push(dayInventoryValues[i]);

        for (var j = 1; j < inventoryValues.length; j++) {
            tempArr.push(colorArr[i]);
        }

        trafficColorArr.push(tempArr);

    }
    trafficColorArr[2][1] = "SOLDOUT";
    trafficColorArr[2][2] = "SOLDOUT";
    // trafficColorArr will look like : https://ibb.co/0h6Rg84
    return trafficColorArr;
}

const giveTrafficColor = (dayInv, inv) => {
    let inventory = 1, dayInventory = 1;
    for (var i = inventoryValues.length - 1; i > 0; i--) {
        if (inv >= inventoryValues[i]) {
            inventory = i;
            break;
        }
    }

    for (var i = dayInventoryValues.length - 1; i >= 0; i--) {
        if (dayInv >= dayInventoryValues[i]) {
            dayInventory = i + 1;
            break;
        }
    }

    return trafficColorArr[dayInventory][inventory];
}

const getTrafficShortCode = (color) => {
    if (color === "OVERGREEN")
        return "OG";
    else return color[0] + color[1];

}

//=-=-=-=-=-=-=-=-=-=-=-=DEFINING CONSTANTS FOR TRAFFIC COLOR DATA POPULATION-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
const trafficColorArr = getTrafficColorArr();
//-=-=-=-=-=-=-=-=-=-=-=-=DEFINING CONSTANTS FOR TRAFFIC COLOR DATA POPULATION ENDS-=-=-=-=-=-=-=-=-=-=-=-=-=-=


//MAPPING STYLECODES WITH TRAFFIC COLOR ----START
const styleCodes = new Map();
const trafficColorCountUsingStyleCode = (styleCode, trafficColor) => {

    const colorCount = new Map();
    var count = 1;
    colorCount.set(trafficColor, 0);

    if (!styleCodes.get(styleCode))
        styleCodes.set(styleCode, colorCount);

    if (styleCodes.get(styleCode).get(trafficColor))
        count = styleCodes.get(styleCode).get(trafficColor) + 1;

    styleCodes.get(styleCode).set(trafficColor, count);
}
//MAPPING STYLECODES WITH TRAFFIC COLOR ----END



const storeUniqueStyleCodes = (styleCode) => {
    let check = false;
    check = styleCodeArr.find(function (ele) {
        return ele === styleCode;
    })

    if (!check)
        styleCodeArr.push(styleCode);
}


const setColorCount = () => {

    const allColorCount = new Map();
    styleCodeArr.map((styleCode) => {
        const colorCount = new Map();
        for (let i = 0; i < defaultTrafficColors.length; i++) {
            if (styleCodes.get(styleCode).get(defaultTrafficColors[i]))
                colorCount.set(defaultTrafficColors[i], styleCodes.get(styleCode).get(defaultTrafficColors[i]));
            else colorCount.set(defaultTrafficColors[i], 0)
        }
        allColorCount.set(styleCode, colorCount);
    })
    return allColorCount;
}


const setColorScore = (colorCount) => {
    const mapColorScoreWithSyleCode = new Map();
    styleCodeArr.map((styleCode) => {
        let score = 0, cnt = 4;
        for (let i = 0; i < defaultTrafficColors.length; i++) {
            score = score + cnt * colorCount.get(styleCode).get(defaultTrafficColors[i]);
            cnt -= 1;
            if (!cnt)
                cnt += 1;
        }
        mapColorScoreWithSyleCode.set(styleCode, score);
    })
    return mapColorScoreWithSyleCode;
}

const setColorProduct = (totalSalesOfStylecode, colorScore) => {
    const colorProduct = new Map();
    styleCodeArr.map((styleCode) => {
        const product = totalSalesOfStylecode.get(styleCode) * colorScore.get(styleCode);
        colorProduct.set(styleCode, product);
    })
    return colorProduct;
}

const setReplenishmentRank = (colorProduct) => {
    const sortedColorPoduct = new Map([...colorProduct.entries()].sort((a, b) => b[1] - a[1])); //DECREASING ORDER
    const replenishmentRank = new Map();
    const sortedStyleCodes = new Array();
    sortedColorPoduct.forEach(function (value, key) {
        sortedStyleCodes.push(key);
    });
    let rank = 1;
    for (var i = 0; i < sortedStyleCodes.length; i++) {
        const styleCode = sortedStyleCodes[i];
        if (!i) {
            replenishmentRank.set(styleCode, 1);
            continue;
        }
        const prevStyleCode = sortedStyleCodes[i - 1];
        if (sortedColorPoduct.get(styleCode) !== sortedColorPoduct.get(prevStyleCode))
            rank += 1;
        replenishmentRank.set(styleCode, rank);
    }
    return replenishmentRank;
}

const setSalesRank = (totalSalesOfStylecode) => {
    const sortedSales = new Map([...totalSalesOfStylecode.entries()].sort((a, b) => b[1] - a[1]));
    const salesRank = new Map();
    const sortedStyleCodes = new Array();
    sortedSales.forEach(function (value, key) {
        sortedStyleCodes.push(key);
    });
    let rank = 1;
    for (var i = 0; i < sortedStyleCodes.length; i++) {
        const styleCode = sortedStyleCodes[i];
        if (!i) {
            salesRank.set(styleCode, 1);
            continue;
        }
        const prevStyleCode = sortedStyleCodes[i - 1];
        if (sortedSales.get(styleCode) !== sortedSales.get(prevStyleCode))
            rank += 1;
        salesRank.set(styleCode, rank);
    }

    return salesRank;
}

const setTrafficColor = (colorCount) => {
    const trafficColor = new Map();
    styleCodeArr.map((styleCode) => {
        for (var i = 0; i < defaultTrafficColors.length; i++) {
            const color = defaultTrafficColors[i];
            if (colorCount.get(styleCode).get(color)) {
                trafficColor.set(styleCode, color);
                break;
            }
        }
    })
    return trafficColor;
}

//MULTER
const fileStorageEngine = multer.diskStorage({
    destination: (res, file, cb) => {
        cb(null, "./csvFiles");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "__" + file.originalname);
    },
});

//INVENTORY OBJ
const createInventoryObj = (clientId, data) => {
    const obj = {
        clientId: clientId,
        facility: data["Facility"],
        itemTypeName: data["Item Type Name"],
        itemSkuCode: data["Item SkuCode"],
        EAN: parseInt(data["EAN"]),
        UPC: parseInt(data["UPC"]),
        ISBN: parseInt(data["ISBN"]),
        color: data["Color"],
        size: data["Size"],
        brand: data["Brand"],
        categoryName: data["Category Name"],
        MRP: parseFloat(data["MRP"]),
        openSale: parseInt(data["Open Sale"]),
        inventory: parseInt(data["Inventory"]),
        inventoryBlocked: parseInt(data["Inventory Blocked"]),
        badInventory: parseInt(data["Bad Inventory"]),
        putawayPending: parseInt(data["Putaway Pending"]),
        pendingInventoryAssessment: parseInt(data["Pending Inventory Assessment"]),
        stockInTransfer: parseInt(data["Stock In Transfer"]),
        openPurchase: parseInt(data["Open Purchase"]),
        enabled: data["Enabled"],
        costPrice: parseInt(data["Cost Price"]),
    }
    return obj;
}

const createSalesObj = (clientId, data) => {
    const obj = {
        clientId: clientId,
        skuCode: data["Sku Code"],
        name: data["Name"],
        inventory: data["Inventory"],
        totalSales: data["Total Sales"],
        dayOfInventory: data["Day Of Inventory"]
    }
    return obj;
}

const upload = multer({ storage: fileStorageEngine });

router.post("/dashboardUploads", upload.fields([{ name: 'skuSales', maxCount: 1 }, { name: 'skuInventory', maxCount: 1 }]), async (req, res) => {
    try {
        var localId = req.cookies.LocalId;

        // if(!localId)
        // localId="6N9yuxkxf6MhmSdOZuvAuze3l943";

        const client = await Client.findOne({ password: localId });
        const clientId = client.clientId;

        // TO DELETE THIS
        // await SkuSales.deleteMany({ clientId: clientId });
        // await Inventory.deleteMany({ clientId: clientId });
        // res.send("ok deleted");

        const err = [], error = [];
        var resjson = [];

        if (req.files && req.files.skuSales && req.files.skuSales.length && req.files.skuSales[0].path) {
            const results = [];
            fs.createReadStream(req.files.skuSales[0].path)
                .pipe(csvParser({}))
                .on("data", (data) => {
                    let obj = createSalesObj(clientId, data);
                    results.push(obj);
                })
                .on("end", async () => {
                    try {
                        const result = await SkuSales.insertMany(results);
                        resjson = [...resjson, result];
                        console.log("Resp of saving skuSales in DB", result);
                    } catch (err) {
                        console.log("error", err);
                        error.push({ message: err });
                    }
                });
        }
        else if (req.body.salesUrl) {
            const results = [];
            var download = function (url, dest) {
                var file = fs.createWriteStream(dest);
                https.get(url, function (response) {
                    response.pipe(file);
                    file.on('finish', function () {
                        fs.createReadStream(dest)
                            .pipe(csvParser({}))
                            .on("data", (data) => {
                                let obj = createSalesObj(clientId, data);
                                results.push(obj);
                            })
                            .on("end", async () => {
                                try {
                                    const result = await SkuSales.insertMany(results);
                                    resjson.push(result);
                                    fs.unlink(dest, (err) => {//deleting created file
                                        if (err) throw err;
                                        console.log("deleted");
                                    });
                                } catch (err) {
                                    error.push({ message: err });
                                }
                            });
                    });
                });
            }
            download(req.body.fileUrl, "csvFiles/SKUSALES" + Date.now());
        }
        else err.push({ field: "skuSales", error: "Not Found" });

        if (req.files && req.files.skuInventory && req.files.skuInventory.length && req.files.skuInventory[0].path) {
            const results = [];
            fs.createReadStream(req.files.skuInventory[0].path)
                .pipe(csvParser({}))
                .on("data", (data) => {
                    let obj = createInventoryObj(clientId, data);
                    results.push(obj);
                })
                .on("end", async () => {
                    try {
                        const result = await Inventory.insertMany(results);
                        // console.log(result);
                        resjson = [...resjson, result];
                    } catch (err) {
                        error.push({ message: err });
                    }
                });
        }
        else if (req.body.inventoryUrl) {
            const results = [];
            var download = function (url, dest) {
                var file = fs.createWriteStream(dest);
                https.get(url, function (response) {
                    response.pipe(file);
                    file.on('finish', function () {
                        fs.createReadStream(dest)
                            .pipe(csvParser({}))
                            .on("data", (data) => {
                                let obj = createInventoryObj(clientId, data);
                                results.push(obj);
                            })
                            .on("end", async () => {
                                try {
                                    const result = await Inventory.insertMany(results);
                                    resjson = [...resjson, result];
                                } catch (err) {
                                    error.push({ message: err });
                                }
                            });
                    })
                })
            }
            download(req.body.fileUrl, "csvFiles/INVENTORY" + Date.now());
        }
        else err.push({ field: "skuInventory", error: "Not Found" });
        console.log(resjson);
        if (err.length) {
            res.status(400).json(err);
        }
        else {
            styleTraffic(req, res);
        }
    } catch (err) {
        res.status(400).json({ message1: err })
    }
})

const styleTraffic = async (req, res) => {

    try {
        var localId = req.cookies.LocalId;
        // if(!localId)
        // localId="6N9yuxkxf6MhmSdOZuvAuze3l943";

        const client = await Client.findOne({ password: localId });
        const clientId = client.clientId;

        await SkuTrafficMongo.deleteMany({ clientId: clientId });
        await StyleTraffic.deleteMany({ clientId: clientId });

        const allSkus = await SkuMaster.find({ clientId: clientId });
        const allSkuSales = await SkuSales.find({ clientId: clientId });
        const allSkuInventory = await Inventory.find({ clientId: clientId });
        const styleMaster = await Style.find({ clientId: clientId });

        const skuSalesMap = new Map();
        const skuInvMap = new Map();

        for (var i = 0; i < allSkus.length; i++) {
            const skuSalesData = allSkuSales.find(ele => ele.skuCode === allSkus[i].skuCode);
            const skuInventoryData = allSkuInventory.find(ele => ele.itemSkuCode === allSkus[i].skuCode);
            skuSalesMap.set(allSkus[i].skuCode, skuSalesData);
            skuInvMap.set(allSkus[i].skuCode, skuInventoryData);
        }


        var itemMaster = [];
        const totalInventoryOfStylecode = new Map();
        const totalSalesOfStylecode = new Map();
        for (let i = 0; i < allSkus.length; i++) {
            const skuSalesData = skuSalesMap.get(allSkus[i].skuCode);
            const skuInventoryData = skuInvMap.get(allSkus[i].skuCode);


            let TotalSales = 0, DayOfInventory = 0, inventory = 0, styleCode = allSkus[i].styleCode, skuCode = allSkus[i].skuCode, sizeCode = allSkus[i].sizeCode;

            //STORING UNIQUE STYLECODES -----START
            storeUniqueStyleCodes(styleCode);

            //STORING UNIQUE STYLECODES -----END

            if (skuInventoryData && skuInventoryData.inventory)
                inventory = skuInventoryData.inventory;

            if (skuSalesData && skuSalesData.totalSales)
                TotalSales = skuSalesData.totalSales;
            if (skuSalesData && skuSalesData.dayOfInventory)
                DayOfInventory = skuSalesData.dayOfInventory;


            const prevInventory = totalInventoryOfStylecode.get(styleCode);
            const prevSales = totalSalesOfStylecode.get(styleCode);

            if (!prevInventory)
                totalInventoryOfStylecode.set(styleCode, inventory);
            else totalInventoryOfStylecode.set(styleCode, prevInventory + inventory);

            if (!prevSales)
                totalSalesOfStylecode.set(styleCode, TotalSales)
            else totalSalesOfStylecode.set(styleCode, prevSales + TotalSales)


            let dayInventory = 0;
            if (TotalSales)
                dayInventory = Math.round((inventory * 30) / TotalSales);
            else
                dayInventory = Math.round((inventory * 30) / 0.2);

            const trafficColor = giveTrafficColor(dayInventory, inventory);
            const trafficShortCode = getTrafficShortCode(trafficColor);
            const skuTrafficCode = trafficShortCode + "_" + dayInventory + "D_" + inventory + "C_" + TotalSales + "S#";
            const planDay1 = 30, planDay2 = 60, planDay3 = 90;
            let suggestedInventory1 = (((planDay1 / 30) * TotalSales - inventory) > 0 ? ((planDay1 / 30) * TotalSales - inventory) : 0);//suggestedInventory1 = (planDay1 / 30) * TotalSales - inventory
            let suggestedInventory2 = (((planDay2 / 30) * TotalSales - inventory) > 0 ? ((planDay2 / 30) * TotalSales - inventory) : 0);//suggestedInventory2 = (planDay2 / 30) * TotalSales - inventory
            let suggestedInventory3 = (((planDay3 / 30) * TotalSales - inventory) > 0 ? ((planDay3 / 30) * TotalSales - inventory) : 0);//suggestedInventory3 = (planDay3 / 30) * TotalSales - inventory
            let suggestedSmoothInventory1, suggestedSmoothInventory2, suggestedSmoothInventory3;
            if (suggestedInventory1 < 100)
                suggestedSmoothInventory1 = (Math.round(suggestedInventory1 / 10)) * 10;
            else
                suggestedSmoothInventory1 = (Math.round(suggestedInventory1 / 100)) * 100;

            if (suggestedInventory2 < 100)
                suggestedSmoothInventory2 = (Math.round(suggestedInventory2 / 10)) * 10;
            else
                suggestedSmoothInventory2 = (Math.round(suggestedInventory2 / 100)) * 100;

            if (suggestedInventory3 < 100)
                suggestedSmoothInventory3 = (Math.round(suggestedInventory3 / 10)) * 10;
            else
                suggestedSmoothInventory3 = (Math.round(suggestedInventory3 / 100)) * 100;

            //MAPPING STYLECODES WITH TRAFFIC COLOR ----START
            trafficColorCountUsingStyleCode(styleCode, trafficColor);

            let skuData = {
                clientId: clientId,
                skuCode: skuCode,
                styleCode: styleCode,
                sizeCode: sizeCode,
                totalSales: TotalSales,
                dayOfInventory: DayOfInventory,
                inventory: inventory,
                inventoryVirtual: inventory,
                dayInventory: dayInventory,
                dayInventoryVirtual: dayInventory,
                trafficColor: trafficColor,
                trafficShortCode: trafficShortCode,
                trafficShortCodeVirtual: trafficShortCode,
                skuTrafficCode: skuTrafficCode,
                skuTrafficCodeVirtual: skuTrafficCode,
                suggestedInventory1: suggestedInventory1,
                suggestedSmoothInventory1: suggestedSmoothInventory1,
                suggestedInventory2: suggestedInventory2,
                suggestedSmoothInventory2: suggestedSmoothInventory2,
                suggestedInventory3: suggestedInventory3,
                suggestedSmoothInventory3: suggestedSmoothInventory3
            };

            itemMaster.push(skuData);
        }
        const Item = await SkuTrafficMongo.insertMany(itemMaster);
        console.log("itemMaster", Item);
        //SETTING TRAFFIC COLORS COUNT 
        const colorCount = setColorCount();
        const colorScore = setColorScore(colorCount);
        const colorProduct = setColorProduct(totalSalesOfStylecode, colorScore);
        const replenishmentRank = setReplenishmentRank(colorProduct);
        const salesRank = setSalesRank(totalSalesOfStylecode)
        const trafficColor = setTrafficColor(colorCount);
        const finalArray = [];
        const statusArr = ["Launching", "Live", "Disabled"];
        let summaryObj = {};
        for (let i = 0; i < styleCodeArr.length; i++) {
            let styleCode = styleCodeArr[i],
                currentInv = totalInventoryOfStylecode.get(styleCode),
                salesNumber = totalSalesOfStylecode.get(styleCode),
                status = styleMaster.find(ele => ele.styleCode === styleCode).status;

            if (status === null) {
                status = statusArr[Math.floor(Math.random() * 3)];
            }
            let obj = {
                clientId: clientId,
                styleCode: styleCode,
                trafficActual: trafficColor.get(styleCode),
                trafficVirtual: trafficColor.get(styleCode),
                status: status,
                currentInv: currentInv,
                salesNumber: salesNumber,
                salesRank: salesRank.get(styleCode),
                replenishmentRank: replenishmentRank.get(styleCode)
            }
            if (!summaryObj[obj.trafficActual])
                summaryObj[obj.trafficActual] = 0;
            summaryObj[obj.trafficActual] += 1;//CHECK WHY IT'S NOT WORKING
            // console.log(obj);
            finalArray.push(obj);
        }
        finalArray.sort((a, b) => { return a.salesRank - b.salesRank });
        let summary = {
            soldout: summaryObj["SOLDOUT"],
            red: summaryObj["RED"],
            orange: summaryObj["ORANGE"],
            green: summaryObj["GREEN"],
            overgreen: summaryObj["OVERGREEN"],
            updated: Date.now()
        }
        const dashboard = await StyleTraffic.insertMany(finalArray);
        await Summary.updateOne({ clientId: clientId }, { dashboard: summary }, { new: true });
        res.json({ data: dashboard, summary: summary, error: null });
    }
    catch (err) {
        res.status(400).json({ message: err });
    }
}

router.get("/styleTraffic", async (req, res) => {
    try {
        var localId = req.cookies.LocalId;

        // if(!localId)
        // localId="6N9yuxkxf6MhmSdOZuvAuze3l943"; 

        const client = await Client.findOne({ password: localId });
        const clientId = client.clientId;

        const dashBoard = await StyleTraffic.find({ clientId: clientId });
        const summary = await Summary.findOne({ clientId: clientId });
        res.json({ data: dashBoard, summary: summary, error: null });
    }
    catch (err) {
        res.json({ data: null, error: err })
    }
})

router.get("/exportCsv", async (req, res) => {
    const client = await Client.findOne({ password: req.cookies.LocalId });
    const clientId = client.clientId;
    const dashboard = await StyleTraffic.find({ clientId: clientId });
    const fields = ["clientId", "styleCode", "trafficActual", "trafficVirtual", "currentInv", "salesNumber", "salesRank", "replenishmentRank"];
    const opts = { fields };
    try {
        const parser = new Parser(opts);
        const csv = parser.parse(dashboard);
        fs.writeFile("csvFiles/csv.csv", csv, function (err) {
            if (err)
                throw err;

            res.attachment("csvFiles/csv.csv");
            // res.writeHead(200, {'Content-Type': 'application/csv'}); 
            // res.setHeader("'Content-Type', 'application/csv'")
            res.set('Content-Type', 'application/csv');
            res.download("csvFiles/csv.csv");
            console.log("file Saved");
            // fs.unlink('csvFiles/EXPORT_CSV.csv', (err) => {
            //     if (err) throw err;
            //     console.log('csvFiles/EXPORT_CSV.csv was deleted');
            // })
        });
        // res.status(200).send(csv);
    } catch (err) {
        console.error(err);
    }
})


module.exports = router;
