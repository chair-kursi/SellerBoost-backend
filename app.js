const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv/config");
const app = express();
const port = process.env.PORT || 3002;
const os = require("os")
const cluster = require("cluster")


//CHECKING NUMBER OF CORES RUNNING
// const clusterWorkerSize = os.cpus().length
// if (clusterWorkerSize > 1) {
//   if (cluster.isMaster) {
//     for (let i = 0; i < Math.min(clusterWorkerSize, 3); i++) {
//       cluster.fork()
//     }

//     cluster.on("exit", function (worker) {
//       console.log("Worker", worker.id, " has exitted.")
//     })
//   } else {
//     const app = express()

//     app.listen(port, function () {
//       console.log(`Express server listening on port ${port} and worker ${process.pid}`)
//     })
//   }
// }

// else {
//   const app = express()

//   app.listen(port, function () {
//     console.log(`Express server listening on port ${port} with the single worker ${process.pid}`)
//   })
// }

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
const serviceRouter = require("./routes/styleTraffic");



//MIDDLEWARES
app.use(cors());
app.use(express.json());


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
  .connect(process.env.DB_CONNECTION, 
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
  .then(() => console.log("Database connected!"))
  .catch((err) => console.log(err));

app.listen(port);