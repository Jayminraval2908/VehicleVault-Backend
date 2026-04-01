const nodemailer = require("nodemailer");
require("dotenv").config();

// ✅ Create transporter ONCE
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const mailSend = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html, // ✅ only use html
    };

    const response = await transporter.sendMail(mailOptions);
    console.log("Email sent:", response);

    return response;
  } catch (error) {
    console.log("Email error:", error);
    throw error;
  }
};

module.exports = mailSend;