const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });

const createTransporter = () => {
  return nodemailer.createTransport({
    // service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
    pool: true,
    maxConnections: 1,
    maxMessages: 100,
  });
};

const sendEmail = async (options) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"Zainab Birthday Bot" <${process.env.GMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    // text: options.message,
    html: options.html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${options.email}`);
  } catch (error) {
    console.error(`Failed to send email to ${options.email}:`, error);
    throw error;
  } finally {
    transporter.close();
  }
};

module.exports = sendEmail;
