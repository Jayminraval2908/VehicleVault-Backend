const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema({

  buyer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true
  },

  vehicle_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "vehicles",
    required: true
  },

  offered_amount: {
    type: Number,
    required: true
  },

  seller_response: {
    type: String
  },

  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending"
  }

}, { timestamps: true });

module.exports = mongoose.model("offers", offerSchema);