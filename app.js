const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv/config");
const app = express();
const port = process.env.PORT || 3002;



//IMPORTING ROUTES
const styleRouter = require("./routes/styles");
const globalSizeRouter = require("./routes/globalSizes");
const sizeMasterRouter = require("./routes/sizeMasters");
const skuMasterRouter = require("./routes/skuMasters");
const stylePropMasterRouter = require("./routes/stylePropMasters");
const skuPlanRouter = require("./routes/skuPlans");
const stylePlanRouter = require("./routes/stylePlans");
const inventoryRouter = require("./routes/inventory");
const skuSalesRouter = require("./routes/skuSales");
const skuTrafficRouter = require("./routes/skuTraffic");
const serviceRouter = require("./routes/services");

//MIDDLEWARES
app.use(cors());
app.use(express.json());

app.get("/api/styletraffic", async (req, res) => {
  let styletraffic = [];
  let styleCode = [
      "SB-000297",
      "SB-000127",
      "SB-000328",
      "SB-000319",
      "SB-000078",
      "SB-000275",
      "SB-000257",
      "SB-000395",
      "SB-000337",
    ],
    trafficActual = [
      "RED",
      "SOLUT",
      "SOLUT",
      "SOLUT",
      "ORANGE",
      "OverGreen",
      "GREEN",
      "SOLUT",
      "SOLUT",
    ],
    currentInv = [1140, 283, 139, 76, 638, 210, 298, 6, 179],
    salesNumber = [1864, 1124, 318, 171, 385, 17, 17, 32, 116],
    salesRank = [1, 2, 4, 5, 3, 8, 8, 7, 6];
  for (let i = 0; i < styleCode.length; i++) {
    styletrafficData = {
      styleCode: styleCode[i],
      trafficActual: trafficActual[i],
      currentInv: currentInv[i],
      salesNumber: salesNumber[i],
      salesRank: salesRank[i],
    };
    styletraffic = [...styletraffic, styletrafficData];
  }
  res.send(styletraffic);
});

//USING ROUTES AS A MIDDLEWARE
app.use("/style", styleRouter);
app.use("/sku", skuMasterRouter);
app.use("/size", sizeMasterRouter);
app.use("/", globalSizeRouter);
app.use("/", stylePropMasterRouter);
app.use("/", skuPlanRouter);
app.use("/", stylePlanRouter);
app.use("/api", inventoryRouter);
app.use("/api", skuSalesRouter);
app.use("/", skuTrafficRouter);
app.use("/", serviceRouter);

if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
}

//CONNECT TO DB
mongoose
  .connect(process.env.DB_CONNECTION, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Database connected!"))
  .catch((err) => console.log(err));

app.listen(port);
