    const mongoose = require("mongoose");

    const vehicleImgSchema = new mongoose.Schema({
        vehicle_id:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"vehicles",
            required:true
        },

        seller_id:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"users",
            required:true
        },

        image_url:{
            type:String,
            required:true
        },

        file_id:{
            type:String
        },

        image_type:{
            type:String,
            enum:["cover","gallery","interior","engine","exterior"],
            default:"gallery"
        },

        is_primary:{
            type:Boolean,
            default:false
        }
    },{timestamps:true});

    module.exports = mongoose.model("vehicle_images",vehicleImgSchema);