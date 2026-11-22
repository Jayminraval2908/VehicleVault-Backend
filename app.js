require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

// ✅ Middleware
app.use(express.json());

// ✅ FIXED CORS (NO spaces, NO trailing slash)
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://vehicle-vault-frontend-lake.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [ "Content-Type",
    "Authorization",
    "Cache-Control",
    "Pragma",
    "Expires"
  ],
  credentials: true
}));

// ✅ Routes
const adminRoutes = require("./src/routes/AdminRoute");
app.use("/admin", adminRoutes);

const userRoutes = require("./src/routes/UserRoutes");
app.use("/user", userRoutes);

const vehicleRoutes = require("./src/routes/VehicleRoutes");
app.use("/vehicles", vehicleRoutes);

const inquiryRoutes = require("./src/routes/InquiryRoutes");
app.use("/inquiries", inquiryRoutes);

const inspectionReportRoutes = require("./src/routes/InspectionReportRoutes");
app.use("/inspection", inspectionReportRoutes);

const transactionRoutes = require("./src/routes/TransactionRoutes");
app.use("/transactions", transactionRoutes);

const vehicleDetailsRoutes = require("./src/routes/VehicleDetailsRoutes");
app.use("/vehicledetails", vehicleDetailsRoutes);

const vehicleImageRoutes = require("./src/routes/VehicleImagesRoutes");
app.use("/vehicleimages", vehicleImageRoutes);

const testDriveRoutes = require("./src/routes/TestDriveRoutes");
app.use("/testdrives", testDriveRoutes);

const offerRoutes = require("./src/routes/OfferRoutes");
app.use("/offer", offerRoutes);

const contactRoutes = require("./src/routes/ContactRoute");
app.use("/contact", contactRoutes);

// Health check
app.get("/", (req, res) => res.json({ success: true, message: "API running" }));

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "development" ? err.stack : null,
  });
});

// Connect DB first, then start server
const DBConnection = require("./src/utills/DBConnection");
const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await DBConnection();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error("Startup failed:", err.message);
    process.exit(1);
  }
})();