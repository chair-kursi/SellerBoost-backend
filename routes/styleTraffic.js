const express = require("express");
const router = express.Router();
const StyleTraffic = require("../models/StyleTraffic");
const SkuSales = require("../models/SkuSales");
const SkuMaster = require("../models/SkuMaster");
const Inventory = require("../models/Inventory");
const SkuTrafficMongo = require("../models/SkuTrafficMongo");
const { Parser } = require("json2csv");
const fs = require("fs");
const Style = require("../models/Style");
const Summary = require("../models/Summary");
var https = require("https");
const multer = require("multer");
const csvParser = require("csv-parser");
const Client = require("../models/Client");
const { header } = require("express-validator");
const { isValidSkuCode } = require("../validators/basicValidations");

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
};

const giveTrafficColor = (dayInv, inv) => {
    let inventory = 1,
        dayInventory = 1;
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
};

const getTrafficShortCode = (color) => {
    if (color === "OVERGREEN") return "OG";
    else return color[0] + color[1];
};

//=-=-=-=-=-=-=-=-=-=-=-=DEFINING CONSTANTS FOR TRAFFIC COLOR DATA POPULATION-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
const trafficColorArr = getTrafficColorArr();
//-=-=-=-=-=-=-=-=-=-=-=-=DEFINING CONSTANTS FOR TRAFFIC COLOR DATA POPULATION ENDS-=-=-=-=-=-=-=-=-=-=-=-=-=-=

//MAPPING STYLECODES WITH TRAFFIC COLOR ----START
const styleCodes = new Map();
const trafficColorCountUsingStyleCode = (styleCode, trafficColor) => {
    const colorCount = new Map();
    var count = 1;
    colorCount.set(trafficColor, 0);

    if (!styleCodes.get(styleCode)) styleCodes.set(styleCode, colorCount);

    if (styleCodes.get(styleCode).get(trafficColor))
        count = styleCodes.get(styleCode).get(trafficColor) + 1;

    styleCodes.get(styleCode).set(trafficColor, count);
};
//MAPPING STYLECODES WITH TRAFFIC COLOR ----END

const storeUniqueStyleCodes = (styleCode) => {
    let check = false;
    check = styleCodeArr.find(function (ele) {
        return ele === styleCode;
    });

    if (!check) styleCodeArr.push(styleCode);
};

const setColorCount = () => {
    const allColorCount = new Map();
    styleCodeArr.map((styleCode) => {
        const colorCount = new Map();
        for (let i = 0; i < defaultTrafficColors.length; i++) {
            if (styleCodes.get(styleCode).get(defaultTrafficColors[i]))
                colorCount.set(
                    defaultTrafficColors[i],
                    styleCodes.get(styleCode).get(defaultTrafficColors[i])
                );
            else colorCount.set(defaultTrafficColors[i], 0);
        }
        allColorCount.set(styleCode, colorCount);
    });
    return allColorCount;
};

const setColorScore = (colorCount) => {
    const mapColorScoreWithSyleCode = new Map();
    styleCodeArr.map((styleCode) => {
        let score = 0,
            cnt = 4;
        for (let i = 0; i < defaultTrafficColors.length; i++) {
            score =
                score + cnt * colorCount.get(styleCode).get(defaultTrafficColors[i]);
            cnt -= 1;
            if (!cnt) cnt += 1;
        }
        mapColorScoreWithSyleCode.set(styleCode, score);
    });
    return mapColorScoreWithSyleCode;
};

const setColorProduct = (totalSalesOfStylecode, colorScore) => {
    const colorProduct = new Map();
    styleCodeArr.map((styleCode) => {
        const product =
            totalSalesOfStylecode.get(styleCode) * colorScore.get(styleCode);
        colorProduct.set(styleCode, product);
    });
    return colorProduct;
};

const setReplenishmentRank = (colorProduct) => {
    const sortedColorPoduct = new Map(
        [...colorProduct.entries()].sort((a, b) => b[1] - a[1])
    ); //DECREASING ORDER
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
        if (
            sortedColorPoduct.get(styleCode) !== sortedColorPoduct.get(prevStyleCode)
        )
            rank += 1;
        replenishmentRank.set(styleCode, rank);
    }
    return replenishmentRank;
};

const setSalesRank = (totalSalesOfStylecode) => {
    const sortedSales = new Map(
        [...totalSalesOfStylecode.entries()].sort((a, b) => b[1] - a[1])
    );
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
};

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
    });
    return trafficColor;
};

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
        EAN: parseInt(data["EAN"]) || 0,
        UPC: parseInt(data["UPC"]) || 0,
        ISBN: parseInt(data["ISBN"]) || 0,
        color: data["Color"],
        size: data["Size"],
        brand: data["Brand"],
        categoryName: data["Category Name"],
        MRP: parseFloat(data["MRP"]) || 0,
        openSale: parseInt(data["Open Sale"]) || 0,
        inventory: parseInt(data["Inventory"]) || 0,
        inventoryBlocked: parseInt(data["Inventory Blocked"]) || 0,
        badInventory: parseInt(data["Bad Inventory"]) || 0,
        putawayPending: parseInt(data["Putaway Pending"]) || 0,
        pendingInventoryAssessment:
            parseInt(data["Pending Inventory Assessment"]) || 0,
        stockInTransfer: parseInt(data["Stock In Transfer"]) || 0,
        openPurchase: parseInt(data["Open Purchase"]) || 0,
        enabled: data["Enabled"],
        costPrice: parseInt(data["Cost Price"]) || 0,
    };
    return obj;
};

const createSalesObj = (clientId, data) => {
    const obj = {
        clientId: clientId,
        skuCode: data["Sku Code"],
        name: data["Name"],
        inventory: data["Inventory"],
        totalSales: data["Total Sales"],
        dayOfInventory: data["Day Of Inventory"],
    };
    return obj;
};

const checkForHeaders = (defaultHeaders, incomingHeaders) => {
    if (defaultHeaders.length !== incomingHeaders.length)
        return {
            matched: false,
            error: "Columns must be of length " + defaultHeaders.length + " exactly.",
        };
    let countOfHeaders = 0;
    for (var i = 0; i < defaultHeaders.length; i++) {
        for (var j = 0; j < incomingHeaders.length; j++) {
            if (defaultHeaders[i] === incomingHeaders[j]) {
                countOfHeaders += 1;
                defaultHeaders[i] = "-1";
                incomingHeaders[j] = "-2";
            }
        }
    }
    const unmatchedHeaders = [];
    for (var i = 0; i < incomingHeaders.length; i++) {
        if (incomingHeaders[i] !== "-2") unmatchedHeaders.push(defaultHeaders[i]);
    }

    if (countOfHeaders === defaultHeaders.length)
        return {
            matched: true,
        };
    //   console.log("unmatchedHeaders", unmatchedHeaders);
    return {
        matched: false,
        error: unmatchedHeaders.join(", ") + " didn't Found!!",
    };
};

const upload = multer({ storage: fileStorageEngine });

async function createReadStream(destination) {
    const readSales = fs.createReadStream(destination).pipe(csvParser({}));
    return readSales;
}

async function readCsvOfSales(defaultSalesHeaders, destination, clientId) {
    const readSales = await createReadStream(destination);
    const err = [],
        results = [],
        inValidSku = [];
    var headers = [], rowNum = 0;
    for await (const row of readSales) {
        const obj = createSalesObj(clientId, row);
        rowNum++;
        var isValidSku = isValidSkuCode(obj.skuCode);

        if (
            !isValidSku.length &&
            !results.find((element) => {
                return element.skuCode === obj.skuCode;
            })
        )
            results.push(obj);
        else if (isValidSku.length)
            inValidSku.push({
                Source: "Sales",
                Row: rowNum,
                Data: row,
                Error: "Invalid Sku Found",
            });
        else
            inValidSku.push({
                Source: "Sales",
                Row: rowNum,
                Data: row,
                Error: "Duplicate Sku Found",
            });

        if (!headers.length) headers = Object.keys(row);
    }

    const checkHeaders = checkForHeaders(defaultSalesHeaders, headers);

    if (!checkHeaders.matched) {
        err.push({
            Source: "Sales",
            Row: "NA",
            Data: "NA",
            Error: checkHeaders.error,
        });
    }
    // console.log(results);

    return {
        error: err,
        result: results,
        inValidSku: inValidSku,
    };
}

async function readCsvOfInventory(defaultSalesHeaders, destination, clientId) {
    const readSales = await createReadStream(destination);
    const err = [],
        results = [], inValidSku = [];
    var headers = [], rowNum = 0;
    for await (const row of readSales) {
        const obj = createInventoryObj(clientId, row);
        var isValidSku = isValidSkuCode(obj.itemSkuCode);
        rowNum++;
        if (!isValidSku.length &&
            !results.find((element) => {
                return element.itemSkuCode === obj.itemSkuCode;
            }))
            results.push(obj);
        else if (isValidSku.length)
            inValidSku.push({
                Source: "Inventory",
                Row: rowNum,
                Data: JSON.stringify(row),
                Error: "Invalid Sku Found",
            });
        else
            inValidSku.push({
                Source: "Inventory",
                Row: rowNum,
                Data: JSON.stringify(row),
                Error: "Duplicate Sku Found",
            });

        if (!headers.length) headers = Object.keys(row);
    }

    const checkHeaders = checkForHeaders(defaultSalesHeaders, headers);
    if (!checkHeaders.matched) {
        err.push({
            Source: "Inventory",
            Row: "NA",
            Data: "NA",
            Error: checkHeaders.error,
        });
    }
    // console.log(results);
    return {
        error: err,
        result: results,
        inValidSku: inValidSku
    };
}

router.post(
    "/dashboardUploads",
    upload.fields([
        { name: "skuSales", maxCount: 1 },
        { name: "skuInventory", maxCount: 1 },
    ]),
    async (req, res) => {
        try {
            var localId = req.cookies.LocalId;

            const client = await Client.findOne({ password: localId });
            const clientId = client.clientId;

            const duplicateSku = [];

            // TO DELETE THIS
            await SkuSales.deleteMany({ clientId: clientId });
            await Inventory.deleteMany({ clientId: clientId });

            const error = [];
            var err = [];
            var resultsobj = {};

            const defaultSalesHeaders = [
                "Sku Code",
                "Name",
                "Total Sales",
                "Day Of Inventory",
                "Inventory",
            ];
            const defaultInventoryHeaders = [
                "Facility",
                "Item Type Name",
                "Item SkuCode",
                "EAN",
                "UPC",
                "ISBN",
                "Color",
                "Size",
                "Brand",
                "Category Name",
                "MRP",
                "Open Sale",
                "Inventory",
                "Inventory Blocked",
                "Bad Inventory",
                "Putaway Pending",
                "Pending Inventory Assessment",
                "Stock In Transfer",
                "Open Purchase",
                "Enabled",
                "Cost Price",
            ];

            if (
                req.files &&
                req.files.skuSales &&
                req.files.skuSales.length &&
                req.files.skuSales[0].path
            ) {
                try {
                    var file = await readCsvOfSales(
                        defaultSalesHeaders,
                        req.files.skuSales[0].path,
                        clientId
                    ).then((convertedJson) => {
                        return convertedJson;
                    });

                    const results = file.result;
                    const headerErr = file.error;
                    const inValidSku = file.inValidSku;
                    err.push(...headerErr);
                    duplicateSku.push(...inValidSku);

                    if (!headerErr.length) {
                        const result = await SkuSales.insertMany(results);
                        resultsobj = { ...resultsobj, skuSales: result };
                    }
                    // console.log("Resp of saving skuSales in DB", result);
                } catch (err) {
                    console.log("error", err);
                    error.push({ message: err });
                }
            } else if (req.body.salesUrl) {
                const results = [];
                var download = function (url, dest) {
                    var file = fs.createWriteStream(dest);
                    https.get(url, function (response) {
                        response.pipe(file);
                        file.on("finish", function () {
                            fs.createReadStream(dest)
                                .pipe(csvParser({}))
                                .on("headers", (headers) => {
                                    if (!checkForHeaders(defaultSalesHeaders, headers))
                                        res.json({ data: null, error: "Headers didn't matched" });
                                })
                                .on("data", (data) => {
                                    let obj = createSalesObj(clientId, data);
                                    results.push(obj);
                                })
                                .on("end", async () => {
                                    try {
                                        const result = await SkuSales.insertMany(results);
                                        resultsobj = { ...resultsobj, skuSales: result };
                                        // console.log("Resp of saving skuSales in DB", result);

                                        fs.unlink(dest, (err) => {
                                            //deleting created file
                                            if (err) throw err;
                                            console.log("deleted");
                                        });
                                    } catch (err) {
                                        error.push({ message: err });
                                    }
                                });
                        });
                    });
                };
                download(req.body.fileUrl, "csvFiles/SKUSALES" + Date.now());
            } else
                err.push({
                    Source: "skuSales",
                    Row: "NA",
                    Data: "NA",
                    error: "Not Found",
                });

            if (
                req.files &&
                req.files.skuInventory &&
                req.files.skuInventory.length &&
                req.files.skuInventory[0].path
            ) {
                try {
                    const file = await readCsvOfInventory(
                        defaultInventoryHeaders,
                        req.files.skuInventory[0].path,
                        clientId
                    ).then((convertedJson) => {
                        return convertedJson;
                    });

                    const results = file.result;
                    const headerErr = file.error;
                    const inValidSku = file.inValidSku;

                    err.push(...headerErr);
                    duplicateSku.push(...inValidSku);

                    if (!headerErr.length) {
                        const result = await Inventory.insertMany(results);
                        resultsobj = { ...resultsobj, inventory: result };
                    }
                } catch (err) {
                    console.log({ message: err });
                }
            } else if (req.body.inventoryUrl) {
                const results = [];
                var download = function (url, dest) {
                    var file = fs.createWriteStream(dest);
                    https.get(url, function (response) {
                        response.pipe(file);
                        file.on("finish", function () {
                            fs.createReadStream(dest)
                                .pipe(csvParser({}))
                                .on("headers", (headers) => {
                                    if (!checkForHeaders(defaultInventoryHeaders, headers))
                                        res.json({ data: null, error: "Headers didn't matched" });
                                })
                                .on("data", (data) => {
                                    let obj = createInventoryObj(clientId, data);
                                    results.push(obj);
                                })
                                .on("end", async () => {
                                    try {
                                        const result = await Inventory.insertMany(results);
                                        resultsobj = { ...resultsobj, inventory: result };
                                    } catch (err) {
                                        error.push({ message: err });
                                    }
                                });
                        });
                    });
                };
                download(req.body.fileUrl, "csvFiles/INVENTORY" + Date.now());
            } else
                err.push({
                    Source: "Inventory",
                    Row: "NA",
                    Data: "NA",
                    error: "Not Found",
                });

            // console.log("err", err);
            if (err.length) {
                exportCsv(res, err);
            } else {
                if (duplicateSku.length)
                    exportCsv(res, duplicateSku);
                styleTraffic(clientId, resultsobj).then((dashboard) => {
                    // console.log(dashboard);
                });
            }
        } catch (err) {
            res.status(400).json({ message1: err });
        }
    }
);

//FUNCTIONS FOR STYLETRAFFIC 
const setSuggestedSmoothInv = (suggestedInventoryX) => {
    if (suggestedInventoryX < 100)
        return Math.round(suggestedInventoryX / 10) * 10;
    else
        return Math.round(suggestedInventoryX / 100) * 100;
}

const setSuggestedInv = (planDayX, TotalSales, inventory) => {
    if ((planDayX / 30) * TotalSales - inventory > 0)
        return (planDayX / 30) * TotalSales - inventory;
    else return 0;
}

const setDashboardObj = (clientId, styleCode, trafficActual, trafficVirtual, status, currentInv, salesNumber, salesRank, replenishmentRank) => {
    const obj = {
        clientId: clientId,
        styleCode: styleCode,
        trafficActual: trafficActual,
        trafficVirtual: trafficVirtual,
        status: status,
        currentInv: currentInv,
        salesNumber: salesNumber,
        salesRank: salesRank,
        replenishmentRank: replenishmentRank
    };
    return obj;
}

const setSummaryObj = (summaryObj) => {
    const obj = {
        soldout: summaryObj["SOLDOUT"] || 0,
        red: summaryObj["RED"] || 0,
        orange: summaryObj["ORANGE"] || 0,
        green: summaryObj["GREEN"] || 0,
        overgreen: summaryObj["OVERGREEN"] || 0,
        updated: Date.now(),
    }
    return obj;
}

const getItemMasterObj = (clientId, skuCode, styleCode, sizeCode, TotalSales, DayOfInventory, inventory, dayInventory, trafficColor, trafficShortCode, skuTrafficCode, suggestedInventory1, suggestedSmoothInventory1, suggestedInventory2, suggestedSmoothInventory2, suggestedInventory3, suggestedSmoothInventory3) => {
    const itemMasterObj = {
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
        suggestedSmoothInventory3: suggestedSmoothInventory3,
    };
    return itemMasterObj;
}


const styleTraffic = async (clientId, resultsobj) => {
    try {
        await SkuTrafficMongo.deleteMany({ clientId: clientId });
        await StyleTraffic.deleteMany({ clientId: clientId });

        const allSkus = await SkuMaster.find({ clientId: clientId });
        const allSkuSales = await SkuSales.find({ clientId: clientId });
        const allSkuInventory = await Inventory.find({ clientId: clientId });
        const styleMaster = await Style.find({ clientId: clientId });

        const skuSalesMap = new Map();
        const skuInvMap = new Map();

        for (var i = 0; i < allSkus.length; i++) {
            const skuSalesData = allSkuSales.find(
                (ele) => ele.skuCode === allSkus[i].skuCode
            );
            const skuInventoryData = allSkuInventory.find(
                (ele) => ele.itemSkuCode === allSkus[i].skuCode
            );
            skuSalesMap.set(allSkus[i].skuCode, skuSalesData);
            skuInvMap.set(allSkus[i].skuCode, skuInventoryData);
        }

        var itemMaster = [];
        const totalInventoryOfStylecode = new Map();
        const totalSalesOfStylecode = new Map();
        for (let i = 0; i < allSkus.length; i++) {
            const skuSalesData = skuSalesMap.get(allSkus[i].skuCode);
            const skuInventoryData = skuInvMap.get(allSkus[i].skuCode);

            let TotalSales = 0,
                DayOfInventory = 0,
                inventory = 0,
                styleCode = allSkus[i].styleCode,
                skuCode = allSkus[i].skuCode,
                sizeCode = allSkus[i].sizeCode;

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

            if (!prevInventory) totalInventoryOfStylecode.set(styleCode, inventory);
            else totalInventoryOfStylecode.set(styleCode, prevInventory + inventory);

            if (!prevSales) totalSalesOfStylecode.set(styleCode, TotalSales);
            else totalSalesOfStylecode.set(styleCode, prevSales + TotalSales);

            let dayInventory = 0;
            if (TotalSales) dayInventory = Math.round((inventory * 30) / TotalSales);
            else dayInventory = Math.round((inventory * 30) / 0.2);

            const trafficColor = giveTrafficColor(dayInventory, inventory);
            const trafficShortCode = getTrafficShortCode(trafficColor);

            const skuTrafficCode = trafficShortCode + "_" + dayInventory + "D_" + inventory + "C_" + TotalSales + "S#";

            const planDay1 = 30, planDay2 = 60, planDay3 = 90;

            const suggestedInventory1 = setSuggestedInv(planDay1, TotalSales, inventory), //suggestedInventory1 = (planDay1 / 30) * TotalSales - inventory
                suggestedInventory2 = setSuggestedInv(planDay2, TotalSales, inventory),
                suggestedInventory3 = setSuggestedInv(planDay3, TotalSales, inventory);
            const suggestedSmoothInventory1 = setSuggestedSmoothInv(suggestedInventory1),
                suggestedSmoothInventory2 = setSuggestedSmoothInv(suggestedInventory2),
                suggestedSmoothInventory3 = setSuggestedSmoothInv(suggestedInventory3);

            //MAPPING STYLECODES WITH TRAFFIC COLOR ----START
            trafficColorCountUsingStyleCode(styleCode, trafficColor);
            const itemMasterObj = getItemMasterObj(clientId, skuCode, styleCode, sizeCode, TotalSales, DayOfInventory, inventory, dayInventory, trafficColor, trafficShortCode, skuTrafficCode, suggestedInventory1, suggestedSmoothInventory1, suggestedInventory2, suggestedSmoothInventory2, suggestedInventory3, suggestedSmoothInventory3);

            itemMaster.push(itemMasterObj);
        }
        const Item = await SkuTrafficMongo.insertMany(itemMaster);

        //SETTING TRAFFIC COLORS COUNT
        const colorCount = setColorCount();
        const colorScore = setColorScore(colorCount);
        const colorProduct = setColorProduct(totalSalesOfStylecode, colorScore);
        const replenishmentRank = setReplenishmentRank(colorProduct);
        const salesRank = setSalesRank(totalSalesOfStylecode);
        const trafficColor = setTrafficColor(colorCount);
        const finalArray = [];
        let summaryObj = {};
        for (let i = 0; i < styleCodeArr.length; i++) {
            let styleCode = styleCodeArr[i],
                currentInv = totalInventoryOfStylecode.get(styleCode),
                salesNumber = totalSalesOfStylecode.get(styleCode),
                status = styleMaster.find((ele) => ele.styleCode === styleCode).status;

            if (status === null) {
                status = "Live";
            }
            const obj = setDashboardObj(clientId, styleCode, trafficColor.get(styleCode), trafficColor.get(styleCode), status, currentInv, salesNumber, salesRank.get(styleCode), replenishmentRank.get(styleCode))

            if (!summaryObj[obj.trafficActual]) summaryObj[obj.trafficActual] = 0;
            summaryObj[obj.trafficActual] += 1; //CHECK WHY IT'S NOT WORKING
            // console.log(obj);
            finalArray.push(obj);
        }
        finalArray.sort((a, b) => {
            return a.salesRank - b.salesRank;
        });
        const summary = setSummaryObj(summaryObj);

        const dashboard = await StyleTraffic.insertMany(finalArray);
        var summaryRes;
        const findSummaryOfClient = await Summary.findOne({ clientId: clientId });
        if (findSummaryOfClient) {
            summaryRes = await Summary.updateOne(
                { clientId: clientId },
                { dashboard: summary },
                { new: true }
            );
        }
        else {
            const newSummary = new Summary({
                clientId: clientId,
                dashboard: summary
            });
            summaryRes = await newSummary.save();
        }
        return {
            data: dashboard,
            summary: summaryRes,
            resultsobj: resultsobj,
            error: null,
        };
    } catch (err) {
        console.log({ errorMessage: err });
    }
};

router.get("/styleTraffic", async (req, res) => {

    // const sessionCookie = req.cookies.session || "";
    // admin
    //     .auth()
    //     .verifySessionCookie(sessionCookie, true /** checkRevoked */)
    //     .then(async (userData) => {
    //         console.log("Logged in:", userData.email)
    try {
        var localId = req.cookies.LocalId;
        const client = await Client.findOne({ password: localId });
        const clientId = client.clientId;

        const dashBoard = await StyleTraffic.find({ clientId: clientId });
        res.json({ data: dashBoard, error: null });
    } catch (err) {
        res.json({ data: null, error: err });
    }
    // })
    // .catch((error) => {
    //     res.redirect("/signin");
    // });

});



router.patch("/styleTraffic", async (req, res) => {

    var localId = req.cookies.LocalId;
    const client = await Client.findOne({ password: localId });
    const clientId = client.clientId;

    const styleCode = req.body.styleCode;

    var responseStatus = "NA", error = null;
    const date = new Date(req.body.date).toLocaleDateString();
    const today = new Date().toLocaleDateString();
    const status = req.body.status;
    if (status === "Completed")
        responseStatus = "Completed";
    else if (date !== null) {
        if (date > today)
            responseStatus = "In Progress";
        else
            responseStatus = "Expired";
    }
    // const findOne
    var updatedStyle = {};
    try {
        const style = await StyleTraffic.findOne({ clientId: clientId, styleCode: styleCode });
        if (style) {
            await StyleTraffic.updateOne(
                { clientId: clientId, styleCode: styleCode },
                { planStatus: responseStatus, planDate: date }
            );
            updatedStyle = await StyleTraffic.findOne({ clientId: clientId, styleCode: styleCode });
        }
        else throw `Style Code (${styleCode}) not found!!`;
    }
    catch (err) {
        console.log("ERROR Updating StyleTraffic. " + err);
        error = "ERROR Updating StyleTraffic. " + err;
    }

    res.json({
        data: updatedStyle,
        error: error
    })

})


const exportCsv = (res, json) => {

    const fields = ["Source", "Row", "Data", "Error"];
    const opts = { fields };
    try {
        const parser = new Parser(opts);
        const csv = parser.parse(json);
        const destination = "csvFiles/Sales&InventoryError" + Date.now() + ".csv";
        fs.writeFile(destination, csv, function (err) {
            if (err) throw err;
            res.set("Content-Type", "application/csv");
            res.download(destination);
        });
    } catch (err) {
        console.error(err);
    }
};

module.exports = router;
