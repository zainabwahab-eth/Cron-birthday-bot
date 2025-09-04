# 🎂 Birthday Email Automation

A simple Node.js application that automates sending **birthday emails** to customers.  
The app allows uploading customer data via CSV or manual entry, stores the data in MongoDB,  
and uses a **cron job** to send birthday wishes daily at 7:00 AM via Gmail (Nodemailer).

---

## 🚀 Features

- ✨ Add customers manually or upload via **CSV file**.
- 📦 Stores customer data in **MongoDB**.
- 📧 Sends **automated birthday emails** daily.
- 🔍 Email addresses are **validated** and stored in lowercase to avoid duplicates.
- 🗂 CSV parsing with validation (supports multiple date formats).
- 🗑 Deletes uploaded CSV files from the server after processing.
- 🖥️ Simple **EJS frontend** with:
  - Customer table
  - Overlay form for adding customers
  - CSV upload form
  - Duplicate email error handling

---

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB (with Mongoose)
- **Email Service:** Nodemailer (Gmail with App Password)
- **View Engine:** EJS
- **File Upload:** Multer
- **Date Parsing:** Day.js
- **Task Scheduling:** node-cron

---
