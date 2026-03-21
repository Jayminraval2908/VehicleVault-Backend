const mongoose = require("mongoose");

const inquiriesSchema= new mongoose.Schema({
    buyer_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users",

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