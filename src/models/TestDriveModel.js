const mongoose = require("mongoose");

const testDriveSchema = new mongoose.Schema({

  buyer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true
  },

  seller_id:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"users",
    required: true
  },

  vehicle_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "vehicles",
    required: true
  },

  preferred_date: {
    type: Date,
    required: true
  },

  preferred_time: {
    type: String
  },

  location: {
    type: String
  },

  status: {
    type: String,
    enum: ["Pending", "Approved", "Completed", "Cancelled"],
    default: "Pending"
  }

}, { timestamps: true });

module.exports = mongoose.model("test_drives", testDriveSchema);