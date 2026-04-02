const mongoose = require("mongoose");

const inquiriesSchema= new mongoose.Schema({
   buyer_id: { // ✅ ADD THIS
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true
  },

  seller_id: { // ✅ ADD THIS
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true
  },
  
  vehicle_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"vehicles"
    },

    message:{
        type:String,

    },

    reply:{
        type:String,
        default:""
    },

    status:{
        type:String,
        enum:["Pending","Accepted","Rejected"],
        default:"Pending"
    },

    inquiry_date:{
        type:Date,
        default:Date.now
    }
});

module.exports = mongoose.model("inquiries",inquiriesSchema);