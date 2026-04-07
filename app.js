require("dotenv").config()

const express = require("express");

const app = express();
app.use(express.json())

const cors = require("cors")
app.use(cors({origin:"http://localhost:5173"}))

const adminRoutes = require("./src/routes/AdminRoute");
app.use("/admin",adminRoutes)

const userRoutes = require("./src/routes/UserRoutes")
app.use("/user",userRoutes);

const vehicleRoutes =require("./src/routes/VehicleRoutes")
app.use("/vehicles",vehicleRoutes);

const inquiryRoutes = require("./src/routes/InquiryRoutes")
app.use("/inquiries",inquiryRoutes)

const inspectionReportRoutes = require("./src/routes/InspectionReportRoutes")
app.use("/inspection",inspectionReportRoutes)

const transactionRoutes = require("./src/routes/TransactionRoutes")
app.use("/transactions",transactionRoutes)

const vehicleDetailsRoutes = require("./src/routes/VehicleDetailsRoutes");
app.use("/vehicledetails",vehicleDetailsRoutes);

const vehicleImageRoutes = require("./src/routes/VehicleImagesRoutes");
app.use("/vehicleimages",vehicleImageRoutes);

const testDriveRoutes = require("./src/routes/TestDriveRoutes");
app.use("/testdrives",testDriveRoutes);

const offerRoutes = require("./src/routes/OfferRoutes");
app.use("/offer",offerRoutes);

// const messageRoutes = require("./src/routes/MessageRoutes");
// app.use("/messages", messageRoutes);
    
const DBConnection = require("./src/utills/DBConnection")

DBConnection()

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error",
        stack: process.env.NODE_ENV === "development" ? err.stack : null,
    });
});

const PORT= process.env.PORT
app.listen(PORT,()=>{
    console.log(`Server is connected successfully on port ${PORT}`)
})