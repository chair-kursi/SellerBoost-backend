const express = require("express");
const https = require("https");
const router = express.Router();
const Inventory = require("../models/Inventory");
const csvParser = require("csv-parser");
const multer = require("multer");
const fs = require("fs");
const Client = require("../models/Client");

const fileStorageEngine = multer.diskStorage({
  destination: (res, file, cb) => {
    cb(null, "./csvFiles");
  },
  filename: (req, file, cb) => {
    cb(null, "INVENTORY-"+Date.now() + "__" + file.originalname);
  },
});

const upload = multer({ storage: fileStorageEngine });

const createInventoryObj = (clientId, data) => {
  const obj = {
    clientId: clientId,
    facility: data["Facility"],
    itemTypeName: data["Item Type Name"],
    itemSkuCode: data["Item SkuCode"],
    EAN: data["EAN"],
    UPC: data["UPC"],
    ISBN: data["ISBN"],
    color: data["Color"],
    size: data["Size"],
    brand: data["Brand"],
    categoryName: data["Category Name"],
    MRP: data["MRP"],
    openSale: data["Open Sale"],
    inventory: data["Inventory"],
    inventoryBlocked: data["Inventory Blocked"],
    badInventory: data["Bad Inventory"],
    putawayPending: data["Putaway Pending"],
    pendingInventoryAssessment: data["Pending Inventory Assessment"],
    stockInTransfer: data["Stock In Transfer"],
    openPurchase: data["Open Purchase"],
    enabled: data["Enabled"],
    costPrice: data["Cost Price"],
  }
  return obj;
}

const saveFileOfInventory = async (res, destination, clientId) => {
  const results = [];
  fs.createReadStream(destination)
    .pipe(csvParser({}))
    .on("data", (data) => {
      let obj = createInventoryObj(clientId, data);
      results.push(obj);
    })
    .on("end", async () => {
      try {
        const result = await Inventory.insertMany(results);
        res.json(result);
      } catch (err) {
        console.error("ERROR saving files in DB");
        res.json({ message: err });
      }
    });
}


router.post("/skuInventory", upload.single("csvFile"), async(req, res) => {
  const results = [];

  var localId = req.cookies.LocalId;
  const client = await Client.findOne({ password: localId });
  const clientId = client.clientId;

  if (req.body.fileUrl) {
    var download = function (url, dest) {
      var file = fs.createWriteStream(dest);
      https.get(url, function (response) {
        response.pipe(file);
        file.on('finish', function () {
          saveFileOfInventory(res, dest, clientId);
        })
      })
    }
    download(req.body.fileUrl, "csvFiles/INVENTORY" + Date.now());
  }
  else if (req.file && req.file.path) {
    saveFileOfInventory(res, req.file.path, clientId); 
  }
});


router.get("/skuInventory", async (req, res) => {
  try {
    var localId = req.cookies.LocalId;
    const client = await Client.findOne({ password: localId });
    const clientId = client.clientId;

    const inventory = await Inventory.find({ clientId: clientId });
    res.json({ data: inventory, error: null });

  } catch (err) {
    res.status(400).json({ message: err });
  }
})

module.exports = router;
