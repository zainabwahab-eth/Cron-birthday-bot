const app = require("./app");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });

const DB = process.env.DB_URL;

mongoose
  .connect(DB)
  .then(() => {
    console.log("connection to mongodb successful");
  })
  .catch((err) => console.log("MongoDB Error:", err.message));

const PORT = process.env.PORT || 9000;
app.listen(PORT, () => {
  console.log(`You're listening to port ${PORT}`);
});