const mongoose = require("mongoose");
const validator = require("validator");

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter Name"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: [true, "Someone else already used this emal"],
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    dateOfBirth: {
      type: Date,
      required: [true, "Email is required"],
    },
  },
  { timestamps: true }
);

const Customer = mongoose.model("Customer", customerSchema);

module.exports = Customer;
