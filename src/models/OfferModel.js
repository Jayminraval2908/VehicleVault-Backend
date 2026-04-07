const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema({

  buyer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true
  },
  
  seller_id:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"users",
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
    enum: ["Pending", "Accepted", "Rejected"],
    default: "Pending"
  },
  
  dealStatus: {
    type: String,
    enum: ["negotiating", "offer_accepted", "deal_locked", "completed", "cancelled"],
    default: "negotiating"
  },

  // ✅ NEW FIELD: Buyer confirmation
  buyerConfirmed: {
    type: Boolean,
    default: false
  },

  // ✅ NEW FIELD: Seller confirmation
  sellerConfirmed: {
    type: Boolean,
    default: false
  }


}, { timestamps: true });

module.exports = mongoose.model("offers", offerSchema);