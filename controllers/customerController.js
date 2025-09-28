const fs = require("fs");
const path = require("path");
const cron = require("node-cron");
const multer = require("multer");
const csv = require("fast-csv");
const dayjs = require("dayjs");
const customParseFormat = require("dayjs/plugin/customParseFormat");
const sendEmail = require("./../utils/mail");
const Customer = require("./../models/customerModel");

dayjs.extend(customParseFormat);

const normalizeDate = (input) => {
  if (!input) return null;

  const formats = [
    "DD/MM/YYYY",
    "D/M/YYYY",
    "MM/DD/YYYY",
    "M/D/YYYY",
    "YYYY-MM-DD",
    "DD-MM-YYYY",
    "D-M-YYYY",
    "DD MMM YYYY",
    "D MMM YYYY",
  ];
  for (const format of formats) {
    const parsed = dayjs(input, format, true);
    if (parsed.isValid()) {
      return parsed;
    }
  }
  console.warn(`Could not parse date: ${input}`);
  return null;
};

exports.upload = multer({
  dest: path.join(__dirname, "../uploads"),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "text/csv") {
      cb(null, true);
    } else {
      cb(new Error("File must be in CSV format"), false);
    }
  },
  limits: {
    fileSize: 3 * 1024 * 1024, // 3MB
  },
});

const insertCustomers = async (req, res, customers) => {
  try {
    const inserted = await Customer.insertMany(customers, { ordered: false });

    return res.status(201).json({
      status: "success",
      message: "Customers added successfully",
      data: {
        customers: inserted,
      },
    });
  } catch (err) {
    // console.log(err);
    if (err.writeErrors) {
      const failedIndexes = err.writeErrors.map((e) => e.index);

      const successfulCustomersData = customers.filter(
        (_, i) => !failedIndexes.includes(i)
      );
      const successfulEmails = successfulCustomersData.map((c) => c.email);

      const insertedDocs = await Customer.find({
        email: { $in: successfulEmails },
      });

      const failedCustomers = failedIndexes.map((i) => customers[i]);

      return res.status(207).json({
        status: "partial",
        message: "Some customers added, some failed due to duplicates",
        data: {
          customers: insertedDocs,
        },
        failedCustomers,
      });
    }
    return res.status(500).json({
      status: "error",
      message: "Error adding customers",
      error: err.message,
    });
  }
};

exports.uploadCSV = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      status: "error",
      message: "Please upload a CSV file",
    });
  }

  const filePath = req.file.path;
  const customers = [];

  fs.createReadStream(filePath)
    .pipe(csv.parse({ headers: true }))
    .on("error", (error) => {
      console.error(error.message);
      return res.status(500).json({
        status: "error",
        message: "Error parsing CSV file",
      });
    })
    .on("data", (row) => {
      customers.push({
        name: row.name || row.Name,
        email: row.email || row.Email,
        dateOfBirth: normalizeDate(row.dateOfBirth || row.DateOfBirth),
      });
    })
    .on("end", async () => {
      console.log(customers);
      const validCustomers = customers.filter(
        (c) => c.name && c.email && c.dateOfBirth
      );

      if (validCustomers.length === 0) {
        return res.status(400).json({
          status: "error",
          message: "No valid customers found in CSV",
        });
      }
      await insertCustomers(req, res, validCustomers);
      fs.unlinkSync(filePath);
    });
};

exports.addCustomers = async (req, res, next) => {
  const customers = req.body.customers.map((c) => ({
    name: c.name,
    email: c.email,
    dateOfBirth: c.dateOfBirth,
  }));

  if (!customers || !Array.isArray(customers)) {
    return res
      .status(400)
      .json({ message: "customers field must be an array" });
  }

  await insertCustomers(req, res, customers);
};

exports.getAllCustomers = async (req, res, next) => {
  try {
    const customers = await Customer.find();
    return res.status(201).json({
      status: "success",
      meassage: customers.length,
      data: {
        customers,
      },
    });
  } catch (err) {
    return res.status(400).json({
      staus: "fail",
      message: "Something went wrong",
    });
  }
};

exports.deleteCustomer = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    await Customer.findByIdAndDelete(userId);
    return res.status(201).json({
      status: "success",
      message: null,
    });
  } catch (err) {
    console.error(err.message);
    return res.status(400).json({
      staus: "fail",
      message: "Something went wrong",
    });
  }
};

// Function to check birthdays and send emails
async function sendBirthdayEmails() {
  const today = new Date();
  const month = today.getMonth() + 1;
  const day = today.getDate();

  try {
    const constomers = await Customer.find();
    const birthdayPeople = constomers.filter((customer) => {
      const dob = new Date(customer.dateOfBirth);
      return dob.getDate() === day && dob.getMonth() + 1 === month;
    });

    for (const person of birthdayPeople) {
      try {
        console.log(`Sending email to ${person.email} 🎉`);
        await sendEmail({
          email: person.email,
          subject: "Happy Birthday!!!",
          html: "<h1>🎉 Happy Birthday!</h1><p>Wishing you a wonderful day!</p>",
        });
      } catch (err) {
        console.error(`Error sending email to ${person.email}:`, err);
      }
    }
  } catch (err) {
    console.error("Error in sendBirthdayEmails:", err);
  }
}


cron.schedule("0 7 * * *", () => {
  console.log("Running birthday check...");
  sendBirthdayEmails();
});

// const sendNow = async () => {
//   console.log("sending email...");
//   try {
//     await sendEmail({
//       email: "zainabwahab100@gmail.com",
//       subject: "Happy Birthday!",
//       html: "<h1>🎉 Happy Birthday!</h1><p>Wishing you a wonderful day!</p>",
//     });
//   } catch (err) {
//     console.error(err);
//   }
// };

// sendNow();
