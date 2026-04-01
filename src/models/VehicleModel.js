const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema({
    seller_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users",
        required:true
    },

    make:{
        type:String,
        required:true
    },

    model:{
        type:String,
        required:true
    },

    year:{
        type:Number,
        required:true
    },

    mileage:{
        type:Number,
        
    },

    fuel_type:{
        type:String,
        enum:["Petrol","Diesel","Electric","Hybrid","CNG"]
    },

    transmission:{
        type:String,
        enum:["Manual","Automatic"],
        required:true
    },

    images: {
        type: [String],
        default:[],
        required: false // Or true if you want to force an image
    },

    coverImage: {
    type: String,
    default: ""
    },

    price:{
        type:Number,
        required:true
    },

    color:{
        type:String,
    },

    location:{
        type:String
    },

    description:{
        type:String
    },

  


    status:{
        type:String,
        enum:["Draft","Pending", "Approved", "Rejected", "Sold"],
        default:"Pending"
    }

},{timestamps:true});

module.exports = mongoose.model("vehicles",vehicleSchema);