const mongoose = require("mongoose");
require("dotenv").config();

const DBConnection = async () => {
  if (!process.env.DB_URL) {
    throw new Error("DB_URL is not set");
  }

  await mongoose.connect(process.env.DB_URL, {
    serverSelectionTimeoutMS: 10000,
  });

  console.log(
  "DB connected:",
  mongoose.connection.host,
  "| name:",
  mongoose.connection.name
);
};

module.exports = DBConnection;