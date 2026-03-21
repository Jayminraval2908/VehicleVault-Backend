const VehicleModel = require("../models/VehicleModel");

// ADD VEHICLE
const addVehicle = async (req, res) => {
  try {
    const vehicle = await VehicleModel.create({
      ...req.body,
      seller_id: req.user.id, 
    });

    res.status(201).json({
      message: "Vehicle added successfully",
      data: vehicle
    });

  } catch (error) {
    res.status(500).json({ 
      message: "Error adding vehicle", 
      error: error.message 
    });
  }
};

// GET ALL VEHICLES
const getAllVehicles = async (req, res) => {
  try {
    const vehicles = await VehicleModel.find().populate("seller_id");
    res.status(200).json({ 
      message: "Vehicles fetched", 
      data: vehicles 
    });

  } catch (error) {
    res.status(500).json({ 
      message: "Error fetching vehicles", 
      error: error.message 
    });
  }
};

// GET VEHICLE BY ID
const getVehicleById = async (req, res) => {
  try {
    const vehicle = await VehicleModel.findById(req.params.id).populate("seller_id");
    
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    res.status(200).json(vehicle);

  } catch (error) {
    res.status(500).json({ 
      message: "Error fetching vehicle", 
      error: error.message 
    });
  }
};

// GET SELLER VEHICLES
const getSellerVehicles = async (req, res) => {
  try {
    const vehicles = await VehicleModel.find({ seller_id: req.params.sellerId });

    res.status(200).json({ 
      message: "Seller vehicles fetched", 
      data: vehicles 
    });

  } catch (error) {
    res.status(500).json({ 
      message: "Error fetching seller vehicles", 
      error: error.message 
    });
  }
};

// UPDATE VEHICLE
const updateVehicle = async (req, res) => {
  try {
    const vehicle = await VehicleModel.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });

    // 2. Security: Ensure the user is the owner OR an admin
    if (vehicle.seller_id.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized to update this vehicle" });
    }
    const updated = await VehicleModel.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    res.status(200).json({ 
      message: "Vehicle updated successfully", 
      data: updated 
    });

  } catch (error) {
    res.status(500).json({ 
      message: "Error updating vehicle", 
      error: error.message 
    });
  }
};

// DELETE VEHICLE
const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await VehicleModel.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });

    // 2. Security: Ensure the user is the owner OR an admin
    if (vehicle.seller_id.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized to delete this vehicle" });
    }
    const deleted = await VehicleModel.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    res.status(200).json({ 
      message: "Vehicle deleted successfully", 
      data: deleted 
    });

  } catch (error) {
    res.status(500).json({ 
      message: "Error deleting vehicle", 
      error: error.message 
    });
  }
};

module.exports = {
  addVehicle,
  getAllVehicles,
  getVehicleById,
  getSellerVehicles,
  updateVehicle,
  deleteVehicle,
};