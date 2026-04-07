const InspectionModel = require("../models/InspectionReportModel");

// 🚩 ADD INSPECTION REPORT
const addInspectionReport = async (req, res) => {
  try {
    // Destructuring req.body ensures we are receiving the new professional fields
    const { 
      vehicle_id, 
      engineStatus, 
      transmission, 
      interiorGrade, 
      exteriorGrade,
      suspension, 
      brakeCondition, 
      tireLife, 
      acPerformance, 
      accidentHistory, 
      serviceHistory, 
      summary 
    } = req.body;

    const report = await InspectionModel.create({
      vehicle_id,
      engineStatus,
      transmission,
      interiorGrade,
      exteriorGrade,
      suspension,
      brakeCondition,
      tireLife,
      acPerformance,
      accidentHistory,
      serviceHistory,
      summary,
      seller_id: req.user._id || req.user.id
    });

    res.status(201).json({
      success: true,
      message: "Professional Certification Added Successfully",
      data: report,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating inspection report",
      error: error.message,
    });
  }
};

// 🚩 GET ALL REPORTS
const getAllReports = async (req, res) => {
  try {
    const reports = await InspectionModel.find()
      .populate("vehicle_id")
      .populate("seller_id", "name email") // Only fetch necessary seller info
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Inspection reports fetched successfully",
      data: reports,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching reports",
      error: error.message,
    });
  }
};

// 🚩 GET REPORT BY ID
const getReportById = async (req, res) => {
  try {
    const report = await InspectionModel.findById(req.params.id).populate("vehicle_id");

    if (!report) {
      return res.status(404).json({ success: false, message: "Inspection report not found" });
    }

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching report",
      error: error.message,
    });
  }
};

// 🚩 GET REPORT BY VEHICLE
const getVehicleReport = async (req, res) => {
  try {
    const reports = await InspectionModel.find({ vehicle_id: req.params.vehicleId })
      .populate("vehicle_id")
      .sort({ createdAt: -1 });

    if (!reports || reports.length === 0) {
      return res.status(200).json([]); // Return empty array if no reports found
    }

    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching vehicle report",
      error: error.message,
    });
  }
};

// 🚩 UPDATE INSPECTION REPORT
const updateInspectionReport = async (req, res) => {
  try {
    const updatedReport = await InspectionModel.findByIdAndUpdate(
      req.params.id,
      { $set: req.body }, // Use $set to ensure partial updates work for new fields
      { new: true, runValidators: true }
    );

    if (!updatedReport) {
      return res.status(404).json({ success: false, message: "Inspection report not found" });
    }

    res.status(200).json({
      success: true,
      message: "Inspection report updated successfully",
      data: updatedReport,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating inspection report",
      error: error.message,
    });
  }
};

// 🚩 DELETE INSPECTION REPORT
const deleteInspectionReport = async (req, res) => {
  try {
    const deletedReport = await InspectionModel.findByIdAndDelete(req.params.id);

    if (!deletedReport) {
      return res.status(404).json({ success: false, message: "Inspection report not found" });
    }

    res.status(200).json({
      success: true,
      message: "Inspection report deleted successfully",
      data: deletedReport,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting inspection report",
      error: error.message,
    });
  }
};

module.exports = {
  addInspectionReport,
  getAllReports,
  getReportById,
  getVehicleReport,
  updateInspectionReport,
  deleteInspectionReport,
};