const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const customerRoutes = require("./routes/customerRoutes");
const viewRoutes = require("./routes/viewRoutes");

dotenv.config({ path: "./config.env" });

const app = express();

app.set("trust proxy", 1);

app.use(
  cors({
    origin: true,
  })
);

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.set("view engine", "ejs");
app.set("views", `${__dirname}/views`);

app.use("/api/v1/customer", customerRoutes);
app.use("/", viewRoutes);

module.exports = app;
