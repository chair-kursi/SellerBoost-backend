const express = require("express");
const router = express.Router();
const Service = require("../models/Service");
const SkuSales = require("../models/SkuSales");
const SkuMaster = require('../models/SkuMaster');
const Inventory = require("../models/Inventory");
const { getClientId } = require("../services/getClientId");
const SkuTrafficMongo = require("../models/SkuTrafficMongo");
const json2csv = require("json2csv");

const clientId = getClientId();

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




router.get("/itemMaster", async (req, res) => {

    try {
        const allSkus = await SkuMaster.find({ clientId: clientId });
        var itemMaster = [];

        const totalInventoryOfStylecode = new Map();
        const totalSalesOfStylecode = new Map();
        for (let i = 0; i < allSkus.length; i++) {
            const skuSalesData = await SkuSales.findOne({ clientId: clientId, SkuCode: allSkus[i].skuCode });
            const skuInventoryData = await Inventory.findOne({ clientId: clientId, ItemSkuCode: allSkus[i].skuCode });


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
            const suggestedInventory1 = (((planDay1 / 30) * TotalSales - inventory) > 0 ? ((planDay1 / 30) * TotalSales - inventory) : 0);//suggestedInventory1 = (planDay1 / 30) * TotalSales - inventory
            const suggestedInventory2 = (((planDay2 / 30) * TotalSales - inventory) > 0 ? ((planDay2 / 30) * TotalSales - inventory) : 0);//suggestedInventory2 = (planDay2 / 30) * TotalSales - inventory
            const suggestedInventory3 = (((planDay3 / 30) * TotalSales - inventory) > 0 ? ((planDay3 / 30) * TotalSales - inventory) : 0);//suggestedInventory3 = (planDay3 / 30) * TotalSales - inventory


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
                suggestedInventory2: suggestedInventory2,
                suggestedInventory3: suggestedInventory3,
            };
            const item = new SkuTrafficMongo(skuData);
            const savedItem = await item.save();

            itemMaster.push(savedItem);
        }

        //SETTING TRAFFIC COLORS COUNT 
        const colorCount = setColorCount();
        const colorScore = setColorScore(colorCount);
        const colorProduct = setColorProduct(totalSalesOfStylecode, colorScore);
        const replenishmentRank = setReplenishmentRank(colorProduct);
        const salesRank = setSalesRank(totalSalesOfStylecode)
        const trafficColor = setTrafficColor(colorCount);
        const finalArray = [];
        for (let i = 0; i < styleCodeArr.length; i++) {
            let styleCode = styleCodeArr[i],
                currentInv = totalInventoryOfStylecode.get(styleCode),
                salesNumber = totalSalesOfStylecode.get(styleCode);


            let obj = {
                clientId: clientId,
                styleCode: styleCode,
                trafficActual: trafficColor.get(styleCode),
                trafficVirtual: trafficColor.get(styleCode),
                currentInv: currentInv,
                salesNumber: salesNumber,
                salesRank: salesRank.get(styleCode),
                replenishmentRank: replenishmentRank.get(styleCode)
            }
            finalArray.push(obj);
        }
        finalArray.sort((a, b) => { return a.salesRank - b.salesRank })
        const dashboard = await Service.insertMany(finalArray);


        // json2csv({ data: dashboard, fields: ["Facility", "Item Type Name", "Item SkuCode", "EAN", "UPC", "ISBN", "Color", "Size", "Brand", "Category Name", "MRP", "Open Sale", "Inventory", "Inventory Blocked", "Bad Inventory", "Putaway Pending", "Pending Inventory Assessment", "Stock In Transfer", "Open Purchase", "Enabled", "Cost Price"] }, function (err, csv) {
        //     if (err) console.log(err);
        //     fs.writeFile('file.csv', csv, function (err) {
        //         if (err) throw err;
        //         console.log('file saved');
        //     });
        // });
        res.json({ data: dashboard, error: null });


    }
    catch (err) {
        res.json({ message: err });
    }
})

module.exports = router;
