const VehicleDetailsModel = require("../models/VehicleDetailsModel");

// ADD VEHICLE DETAILS
const addVehicleDetails = async (req, res) => {
  try {
    const { vehicle_id } = req.body;

    // 1. Prevent duplicate details for the same car
    const existing = await VehicleDetailsModel.findOne({ vehicle_id });
    if (existing) return res.status(400).json({ message: "Details already exist for this vehicle." });  

    const details = await VehicleDetailsModel.create({
      ...req.body,
      seller_id: req.user._id, // Keeps track of the creator
    });

    res.status(201).json({ 
      message: "Vehicle details added", 
      data: details 
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error adding vehicle details", 
      error: error.message 
    });
  }
};

// GET ALL VEHICLE DETAILS
const getAllVehicleDetails = async (req, res) => {
  try {
    const details = await VehicleDetailsModel.find().populate("vehicle_id");

    res.status(200).json({
       message: "Vehicle details fetched", 
       data: details 
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error fetching vehicle details", 
      error: error.message 
    });
  }
};

// GET VEHICLE DETAILS BY VEHICLE
const getVehicleDetailsByVehicle = async (req, res) => {
  try {
    const details = await VehicleDetailsModel.find({ vehicle_id: req.params.vehicleId }).populate("vehicle_id");

    res.status(200).json({ 
      message: "Vehicle details fetched", 
      data: details 
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error fetching vehicle details", 
      error: error.message 
    });
  }
};

// GET VEHICLE DETAILS BY ID
const getVehicleDetailsById = async (req, res) => {
  try {
    const details = await VehicleDetailsModel.findById(req.params.id).populate("vehicle_id");

    if (!details) {
      return res.status(404).json({ message: "Vehicle details not found" });
    }

    res.status(200).json(details);
  } catch (error) {
    res.status(500).json({ 
      message: "Error fetching vehicle details", 
      error: error.message 
    });
  }
};

// UPDATE VEHICLE DETAILS
const updateVehicleDetails = async (req, res) => {
  try {
    const details = await VehicleDetailsModel.findById(req.params.id);
    if (!details) return res.status(404).json({ message: "Not found" });

    // 2. Ownership Check
    if (details.seller_id.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized access" });
    }
    
    const updated = await VehicleDetailsModel.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Vehicle details not found" });
    }

    res.status(200).json({ 
      message: "Vehicle details updated", 
      data: updated 
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error updating vehicle details", 
      error: error.message 
    });
  }
};

// DELETE VEHICLE DETAILS
const deleteVehicleDetails = async (req, res) => {
  try {
    const deleted = await VehicleDetailsModel.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Vehicle details not found" });
    }

    res.status(200).json({ 
      message: "Vehicle details deleted", 
      data: deleted 
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error deleting vehicle details", 
      error: error.message 
    });
  }
};

module.exports = {
  addVehicleDetails,
  getAllVehicleDetails,
  getVehicleDetailsByVehicle,
  getVehicleDetailsById,
  updateVehicleDetails,
  deleteVehicleDetails,
};