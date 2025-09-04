const Customer = require("./../models/customerModel");

exports.getDashboadPage = async (req, res, next) => {
  const customers = await Customer.find();
  res.render("dashboard", {
    customers,
  });
};
