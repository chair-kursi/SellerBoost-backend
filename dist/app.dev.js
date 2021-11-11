"use strict";

var express = require("express");

var mongoose = require("mongoose");

var cors = require("cors");

var dotenv = require('dotenv');

var csrf = require("csurf");

var admin = require("firebase-admin");

var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount) // databaseURL: "https://server-auth-41acc.firebaseio.com",

});
dotenv.config({
  path: __dirname + '/.env'
});
var csrfMiddleware = csrf({
  cookie: true
});

var cookiesParser = require('cookie-parser'); // require("dotenv/config");


var app = express();
var port = process.env.PORT || 3002;

var os = require("os");

var cluster = require("cluster"); //CHECKING NUMBER OF CORES RUNNING
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


var styleRouter = require("./routes/styles");

var globalSizeRouter = require("./routes/globalSizes");

var sizeMasterRouter = require("./routes/sizeMasters");

var skuMasterRouter = require("./routes/skuMasters");

var stylePropMasterRouter = require("./routes/stylePropMasters");

var skuPlanRouter = require("./routes/skuPlans");

var stylePlanRouter = require("./routes/stylePlans");

var inventoryRouter = require("./routes/inventory");

var skuSalesRouter = require("./routes/skuSales");

var skuTrafficRouter = require("./routes/skuTraffic");

var styleTrafficRouter = require("./routes/styleTraffic");

var marketplaceHealthRouter = require("./routes/marketplaceHealth");

var clientRouter = require("./routes/clients");

var setUpRouter = require("./routes/setUp");

var summaryRouter = require("./routes/summary"); //MIDDLEWARES


app.use(cors({
  credentials: true,
  allowedHeaders: ['Origin', 'X-Requested0-With', 'Content-Type', 'Accept'],
  methods: ['GET', 'PUT', 'PATCH', 'POST'],
  origin: ['http://localhost:3000', 'http://dev.suprcommerce.com:3000', 'http://suprcommerce.com', /\.suprcommerce.com\.com$/]
}));
app.use(express.json());
app.use(cookiesParser()); // app.use(csrfMiddleware);
// app.all("*", (req, res, next) => {
//   res.cookie("XSRF-TOKEN", req.csrfToken());
//   next();
// });
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
app.use("/", styleTrafficRouter);
app.use("/api", marketplaceHealthRouter);
app.use("/", clientRouter);
app.use("/", setUpRouter);
app.use("/", summaryRouter);

if (process.env.NODE_ENV === "production") {
  app.use(express["static"]("client/build"));
}

app.post("/sessionLogin", function (req, res) {
  var idToken = req.body.idToken.toString();
  var expiresIn = 60 * 60 * 24 * 7 * 1000; //7 days

  admin.auth().createSessionCookie(idToken, {
    expiresIn: expiresIn
  }).then(function (sessionCookie) {
    var options = {
      maxAge: expiresIn,
      httpOnly: true
    };
    res.cookie("session", sessionCookie, options);
    res.end(JSON.stringify({
      status: "success"
    }));
  }, function (error) {
    res.status(401).send("UNAUTHORIZED REQUEST!");
  });
});
app.get("/sessionLogout", function (req, res) {
  res.clearCookie("session");
  res.redirect("/login");
}); //CONNECT TO DB

mongoose.connect(process.env.DB_CONNECTION, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(function () {
  return console.log("Database connected!");
})["catch"](function (err) {
  return console.log(err);
});
app.listen(port);