const mongoose = require("mongoose")

const transactionSchema = new mongoose.Schema({
    buyer_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users"
    },

    vehicle_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"vehicles"
    },

    amount:{
        type:Number
    },

    payment_method:{
        type:String
    },

    payment_status:{
        type:String,
        enum:["Pending","Paid"],
        default:"Pending"
    },

    transaction_status:{
        type:String,
        enum:["Processing","Completed"],
        default:"Processing"
    },

    payment_date:{
        type:Date
    }
},{timestamps:true});

module.exports = mongoose.model("transactions",transactionSchema);