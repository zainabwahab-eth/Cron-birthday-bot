const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const customerRoutes = require("./routes/customerRoutes");
const viewRoutes = require("./routes/viewRoutes");

dotenv.config({ path: "./config.env" });

const app = express();

// cron.schedule("* * * * *", () => {
//   console.log("Running a task every minute", new Date().toLocaleTimeString());
// });

app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.BACKEND_URL
        : "http://localhost:9000",
  })
);

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.set("view engine", "ejs");
app.set("views", `${__dirname}/views`);

app.use("/api/v1/customer", customerRoutes);
app.use("/", viewRoutes);

module.exports = app;
