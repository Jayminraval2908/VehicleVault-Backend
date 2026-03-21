const mongoose = require("mongoose");

const inspectionSchema = new mongoose.Schema({
    vehicle_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"vehicles",
        required:true
    },
    
    seller_id: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },

    engine_condition:{
        type:String,
        
    },

    tyre_condition:{
        type:String
    },

    body_condition:{
        type:String
    },

    accident_history:{
        type:String
    },

    remarks:{
        type:String
    },

    inspection_date:{
        type:Date,
        default:Date.now
    }
});

module.exports = mongoose.model("inspection_reports",inspectionSchema);