const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

  firstName: {
    type: String,
    required: true,
    trim: true
  },

  lastName: {
    type: String,
    required: true,
    trim: true
  },

  isFirstLogin:{
    type:Boolean,
    default:true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },

  password: {
    type: String,
    required: true
  },

  phone: {
    type: String,
    required: true
  },

  role: {
    type: String,
    enum: ["buyer", "seller", "admin"],
    default: "buyer"
  },

  address: {
    type: String
  },



  status: {
    type: String,
    enum: ["inactive", "active", "delete", "block"],
    default: "active"
  }

}, { timestamps: true });

module.exports = mongoose.model("users", userSchema);