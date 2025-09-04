const express = require("express");
const cron = require("node-cron");
const customerRoutes = require("./routes/customerRoutes");
const viewRoutes = require("./routes/viewRoutes");

const app = express();

cron.schedule("* * * * *", () => {
  console.log("Running a task every minute", new Date().toLocaleTimeString());
});

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.set("view engine", "ejs");
app.set("views", `${__dirname}/views`);

app.use("/api/v1/customer", customerRoutes);
app.use("/", viewRoutes);

module.exports = app;
