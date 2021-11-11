const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require('dotenv');
const csrf = require("csurf");
const admin = require("firebase-admin"); 

const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // databaseURL: "https://server-auth-41acc.firebaseio.com",
});

dotenv.config({ path: __dirname + '/.env' });

const csrfMiddleware = csrf({ cookie: true });
const cookiesParser = require('cookie-parser');

// require("dotenv/config");
const app = express();
const port = process.env.PORT || 3002;
const os = require("os");
const cluster = require("cluster");


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
const styleTrafficRouter = require("./routes/styleTraffic");
const marketplaceHealthRouter = require("./routes/marketplaceHealth");
const clientRouter = require("./routes/clients");
const setUpRouter = require("./routes/setUp");
const summaryRouter = require("./routes/summary");


//MIDDLEWARES
app.use(cors({ credentials: true, allowedHeaders:['Origin', 'X-Requested0-With', 'Content-Type', 'Accept'],
  methods:['GET', 'PUT', 'PATCH', 'POST'],
  origin:['http://localhost:3000', 'http://dev.suprcommerce.com:3000', 'http://suprcommerce.com',/\.suprcommerce.com\.com$/]
}));
app.use(express.json());
app.use(cookiesParser());
// app.use(csrfMiddleware);

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
  app.use(express.static("client/build"));
}

app.post("/sessionLogin", (req, res) => {
  const idToken = req.body.idToken.toString();

  const expiresIn = 60 * 60 * 24 * 7 * 1000;//7 days

  admin
    .auth()
    .createSessionCookie(idToken, { expiresIn })
    .then(
      (sessionCookie) => {
        const options = { maxAge: expiresIn, httpOnly: true };
        res.cookie("session", sessionCookie, options);
        res.end(JSON.stringify({ status: "success" }));
      },
      (error) => {
        res.status(401).send("UNAUTHORIZED REQUEST!");
      }
    );
});


app.get("/sessionLogout", (req, res) => {
  res.clearCookie("session");
  res.redirect("/login");
});


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