const mongoose = require("mongoose");

const inspectionSchema = new mongoose.Schema({
    vehicle_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "vehicles", 
        required: true
    },
    seller_id: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: "users", 
        required: true
    },
    
    // --- CORE GRADES ---
    engineStatus: {
        type: String,
        default: "Excellent"
    },
    transmission: {
        type: String,
        default: "Automatic"
    },
    interiorGrade: {
        type: String,
        default: "A"
    },
    exteriorGrade: {
        type: String,
        default: "A"
    },

    // --- 🚩 NEW PROFESSIONAL FIELDS (To match your Frontend) ---
    suspension: {
        type: String,
        default: "Excellent"
    },
    brakeCondition: {
        type: String,
        default: "Excellent"
    },
    tireLife: { 
        type: String,
        default: "Brand New (90-100%)"
    },
    acPerformance: {
        type: String,
        default: "Chilling"
    },
    accidentHistory: { 
        type: String,
        default: "None"
    },
    serviceHistory: { 
        type: String, 
        default: "Full Service History"
    },

    // --- OBSERVATIONS ---
    summary: {
        type: String,
        required: true
    }

}, { timestamps: true }); // Automatically manages createdAt and updatedAt

module.exports = mongoose.model("inspection_reports", inspectionSchema);