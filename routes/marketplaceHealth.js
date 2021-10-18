const express = require('express');
const router = express.Router();
const MarketplaceHealth = require('../models/MarketplaceHealth');
const fs = require("fs");
const csvParser = require("csv-parser");
var https = require('https');
const SkuMaster = require('../models/SkuMaster');
const StyleTraffic = require('../models/StyleTraffic');
const SkuError = require("../models/SkuError");
const Summary = require('../models/Summary');
const { getClientId } = require('../services/getClientId');


const clientId = getClientId();

router.post("/marketplaceHealth", async (req, res) => {
  try {
    await MarketplaceHealth.deleteMany({});
    const skuMaster = await SkuMaster.find({});
    const styleTraffic = await StyleTraffic.find({});
    const styleCodeMap = new Map();
    for (var i = 0; i < skuMaster.length; i++) {
      if (!styleCodeMap.get(skuMaster[i].styleCode))
        styleCodeMap.set(skuMaster[i].styleCode, [skuMaster[i].skuCode]);
      else styleCodeMap.get(skuMaster[i].styleCode).push(skuMaster[i].skuCode);
    }
    const results = [];
    const styleCodeArr = [];
    const reasonArrMap = new Map();
    const temporary = [];
    const channelCodeArr = [];
    var download = function (url, dest) {
      var file = fs.createWriteStream(dest);
      https.get(url, function (response) {
        response.pipe(file);
        file.on('finish', function () {
          fs.createReadStream(dest)
            .pipe(csvParser({}))
            .on("data", (data) => results.push(data))
            .on("end", async () => {
              const skuError = [];
              for (var i = 0; i < results.length; i++) {
                var obj = {
                  channelCode: results[i]["Channel Code"],
                  sellerSkuOnChannel: results[i]["Seller SKU on Channel"],
                  disabledDueToErrors: (results[i]["Disabled Due To Errors"] === 'true' ? true : false),
                  skuCode: results[i]["SKU Code"],
                  disabledManually: (results[i]["Manually Disabled"] === 'true' ? true : false),
                }

                var temp = skuMaster.find((ele) => { return ele.skuCode === obj.skuCode })
                if (!temp) {
                  skuError.push({ skuCode: obj.skuCode });
                  continue;
                }
                const reasonSizeArr = new Array();
                reasonSizeArr.push({
                  disabledManually: obj.disabledManually,
                  skuCode: obj.skuCode,
                  sizeCode: temp.sizeCode,
                  channelCode: obj.channelCode,
                  styleCode: temp.styleCode,
                  disabledDueToErrors: obj.disabledDueToErrors
                });
                if (reasonArrMap.get(temp.styleCode))
                  reasonArrMap.get(temp.styleCode).push({
                    disabledManually: obj.disabledManually,
                    skuCode: obj.skuCode,
                    sizeCode: temp.sizeCode,
                    channelCode: obj.channelCode,
                    styleCode: temp.styleCode,
                    disabledDueToErrors: obj.disabledDueToErrors
                  });
                else reasonArrMap.set(temp.styleCode, reasonSizeArr);
                if (!styleCodeArr.find((ele) => { return ele === temp.styleCode }))
                  styleCodeArr.push(temp.styleCode);
                if (!channelCodeArr.find((ele) => ele === obj.channelCode))
                  channelCodeArr.push(obj.channelCode);
              }

              const data = {}, summary = [];
              for (var i = 0; i < channelCodeArr.length; i++) {
                const finalArr = [], tempArr = []; let cnt = 0;
                for (var j = 0; j < styleCodeArr.length; j++) {
                  const arr = reasonArrMap.get(styleCodeArr[j]);
                  const newArr = arr.filter((ele) => { return ele.channelCode === channelCodeArr[i] });

                  const totalSkus = styleCodeMap.get(styleCodeArr[j]);
                  const missingArr = [];
                  for (var k = 0; k < newArr.length; k++) {
                    if (!totalSkus.find((ele) => { return ele === newArr[k].skuCode }))
                      missingArr.push(newArr[k].sizeCode);
                  }

                  const disabledArr = newArr.filter((ele) => { return (ele.disabledManually || ele.disabledDueToErrors) }).map((ele) => { return ele.sizeCode });
                  const currentStyle = styleTraffic.filter((ele) => { return (ele.styleCode === styleCodeArr[j]); }).map((ele) => { return ele; });
                  const marketplaceCount = missingArr.length + (newArr.length - disabledArr.length) ;
                  // if(disabledArr.length)
                  // {
                  //   console.log("Disabled", styleCodeArr[j]);
                  // }
                  // if(missingArr.length)
                  // {
                  //   console.log("missingArr", styleCodeArr[j]);
                  // }
                  const obj = {
                    rank: currentStyle[0].salesRank,
                    inventory: currentStyle[0].currentInv,
                    marketplace: channelCodeArr[i],
                    styleCode: styleCodeArr[j],
                    baseCount: (totalSkus.length ? totalSkus.length : 0),
                    marketplaceCount: (marketplaceCount > 0 ? marketplaceCount : 0),
                    reason: {
                      disabled: disabledArr,
                      missing: missingArr
                    }
                  }
                  if (obj.baseCount > obj.marketplaceCount)
                    finalArr.push(obj);
                  // if (styleCodeArr[j] === "SB-000119")
                  //   console.log(channelCodeArr[i], styleCodeMap.get("SB-000119").length, missingArr, disabledArr.length, obj.marketplaceCount);

                }
                finalArr.sort((a, b) => { return a.rank - b.rank });
                data[channelCodeArr[i]] = finalArr;
                summary.push({
                  channelCode: channelCodeArr[i],
                  mismatch: finalArr.length
                });
              }
              // SB-000119
              try {
                const result1 = new MarketplaceHealth(data);
                const result = await result1.save();
                skuError.sort((a, b) => { return a[1] - b[1] });
                await SkuError.insertMany(skuError);
                await Summary.updateMany(
                  { clientId: clientId },
                  {
                    marketplaceHealth: {
                      channels: summary,
                      updated: Date.now()
                    },
                    skuError: {
                      errorCount: skuError.length,
                      updated: Date.now()
                    },
                    updated: Date.now()
                  },
                  { new: true }
                );
                res.json({ data: result, channels: summary, skuError: skuError.length, error: null });
                fs.unlink(dest, (err) => {//deleting created file
                  if (err) throw err;
                  console.log("deleted");
                });
              } catch (err) {
                res.json({ message: err });
              }
            });
        });
      });
    }
    download(req.body.fileUrl, "csvFiles/MarketplaceHealth.csv");

  } catch (err) {
    res.json({ message: err })
  }
})

router.get("/marketplaceHealth", async (req, res) => {
  try {
    const marketplaceHealth = await MarketplaceHealth.find({});
    const summary = await Summary.findOne({ clientId: clientId });
    res.json({ data: marketplaceHealth[0], summary: summary, error: null });
  } catch (err) {
    res.json({ message: err })
  }
})


module.exports = router;
