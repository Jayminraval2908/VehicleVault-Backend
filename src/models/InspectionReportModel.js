const mongoose = require("mongoose");

const inspectionSchema = new mongoose.Schema({
    vehicle_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "vehicles", // Ensure this matches your Vehicle model name
        required: true
    },
    seller_id: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: "users", 
        required: true
    },
    // 🚩 UPDATED TO MATCH FRONTEND AddReport.jsx
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
    summary: {
        type: String
    },
    // Keep these for legacy or additional detail if needed
    tyre_condition: { type: String },
    accident_history: { type: String },
    
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true }); // Automatically adds createdAt and updatedAt

module.exports = mongoose.model("inspection_reports", inspectionSchema);