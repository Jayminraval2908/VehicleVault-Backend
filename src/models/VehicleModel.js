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
        enum:["Petrol","Diesel","Electric","Hybrid"]
    },

    transmission:{
        type:String,
        enum:["Manual","Automatic"],
        required:true
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
        enum:["Available","Sold"],
        default:"Available"
    }

},{timestamps:true});

module.exports = mongoose.model("vehicles",vehicleSchema);