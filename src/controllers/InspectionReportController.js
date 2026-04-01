const InspectionModel = require("../models/InspectionReportModel");

// ADD INSPECTION REPORT
const addInspectionReport = async (req, res) => {
  try {
    const report = await InspectionModel.create({
      ...req.body,
      seller_id: req.user._id || req.user.id // Still tracking who created it
    });

    res.status(201).json({
      message: "Inspection Report Added Successfully",
      data: report,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating inspection report",
      error: error.message,
    });
  }
};

// GET ALL REPORTS
const getAllReports = async (req, res) => {
  try {
    const reports = await InspectionModel.find().populate("vehicle_id").populate("seller_id")

    res.status(200).json({
      message: "Inspection reports fetched successfully",
      data: reports,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching reports",
      error: error.message,
    });
  }
};

// GET REPORT BY ID
const getReportById = async (req, res) => {
  try {
    const report = await InspectionModel.findById(req.params.id).populate("vehicle_id");

    if (!report) {
      return res.status(404).json({ message: "Inspection report not found" });
    }

    res.status(200).json({
    success: true,
    data: report // Always wrap in 'data'
});
  } catch (error) {
    res.status(500).json({
      message: "Error fetching report",
      error: error.message,
    });
  }
};

// GET REPORT BY VEHICLE
const getVehicleReport = async (req, res) => {
  try {
    const report = await InspectionModel.find({ vehicle_id: req.params.vehicleId }).populate("vehicle_id").sort({ createdAt: -1 });;

    if (!report) {
      return res.status(404).json({
        message: "Inspection report not found for this vehicle",
      });
    }

    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching vehicle report",
      error: error.message,
    });
  }
};

// UPDATE INSPECTION REPORT
const updateInspectionReport = async (req, res) => {
  try {
    const updatedReport = await InspectionModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedReport) {
      return res.status(404).json({ message: "Inspection report not found" });
    }

    res.status(200).json({
      message: "Inspection report updated successfully",
      data: updatedReport,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating inspection report",
      error: error.message,
    });
  }
};

// DELETE INSPECTION REPORT
const deleteInspectionReport = async (req, res) => {
  try {
    const deletedReport = await InspectionModel.findByIdAndDelete(req.params.id);

    if (!deletedReport) {
      return res.status(404).json({ message: "Inspection report not found" });
    }

    res.status(200).json({
      message: "Inspection report deleted successfully",
      data: deletedReport,
    });
  } catch (error) {
    res.status(500).json({
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