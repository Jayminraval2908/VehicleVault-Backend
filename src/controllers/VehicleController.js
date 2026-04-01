const VehicleModel = require("../models/VehicleModel");
const mongoose = require("mongoose");
const { uploadFile } = require("../services/StorageService");

const addVehicle = async (req, res) => {
  try {
    console.log("USER:", req.user);
    console.log("FILES:", req.files);

    // 1️⃣ Create vehicle without images first
    const vehicle = await VehicleModel.create({
      ...req.body,
      seller_id: req.user._id || req.user.id,
      status: "Draft",
      images: [], // ensure it's an array
    });

    const imageUrls = [];

    // 2️⃣ Upload each file to ImageKit
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadResponse = await uploadFile(file, vehicle._id);

        // Check what your uploadFile returns
        // It should return something like: { url: "https://ik.imagekit.io/..." }
        console.log("UPLOAD RESPONSE:", uploadResponse);

        if (uploadResponse && uploadResponse.url) {
          imageUrls.push(uploadResponse.url);
        }
      }

      // 3️⃣ Save URLs in MongoDB
      // vehicle.images = imageUrls;
      // await vehicle.save();

      vehicle.images = imageUrls;

// 🔥 AUTO SET COVER IMAGE
if (imageUrls.length > 0) {
  vehicle.coverImage = imageUrls[0];
}

await vehicle.save();
    }

    res.status(201).json({
      message: "Vehicle added successfully",
      data: vehicle,
    });

  } catch (error) {
    console.error("ERROR:", error);
    res.status(500).json({
      message: "Error adding vehicle",
      error: error.message,
    });
  }
};

// GET ALL VEHICLES
const getAllVehicles = async (req, res) => {
  try {
    const vehicles = await VehicleModel.find({ status: "Approved" }).populate("seller_id");
    console.log("🔥 Vehicles from DB:", vehicles); // ADD THIS
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
    // 1. Safety Check: Is the user actually attached to the request?
    if (!req.user || (!req.user._id && !req.user.id)) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // 2. Extract the ID (handling both _id and id formats)
    const userId = req.user._id || req.user.id;

    // 3. Convert to ObjectId to prevent the 500 Error
    const sellerObjectId = new mongoose.Types.ObjectId(userId);

    console.log("Fetching inventory for Seller ID:", sellerObjectId);

    // 4. Perform the find
    const vehicles = await VehicleModel.find({ seller_id: sellerObjectId });

    res.status(200).json({
      message: "Seller vehicles fetched",
      data: vehicles
    });

  } catch (error) {
    console.error("DETAILED ERROR:", error);
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

    // 1. Security Check
    const userId = req.user._id || req.user.id;
    if (vehicle.seller_id.toString() !== userId.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // 2. Handle Images logic
    let updatedImages = [];

    // Keep existing images that weren't deleted in the UI
    if (req.body.existingImages) {
      // Multer sends a single string if there's 1 item, or an array if there are many
      updatedImages = Array.isArray(req.body.existingImages)
        ? req.body.existingImages
        : [req.body.existingImages];
    }

    // 3. Upload NEW images if any were selected
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadResponse = await uploadFile(file, vehicle._id);
        if (uploadResponse && uploadResponse.url) {
          updatedImages.push(uploadResponse.url);
        }
      }
    }



    const updateData = {
  ...req.body,
  images: updatedImages
};

// 🔥 COVER IMAGE SAFETY
if (!updateData.coverImage && updatedImages.length > 0) {
  updateData.coverImage = updatedImages[0];
}

    // Remove existingImages from updateData so it doesn't try to save to Schema
    delete updateData.existingImages;

    const updated = await VehicleModel.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: "Vehicle updated successfully",
      data: updated,
    });

  } catch (error) {
    console.error("UPDATE ERROR:", error);
    res.status(500).json({
      message: "Error updating vehicle",
      error: error.message,
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

// 🚀 SELLER -> SEND TO ADMIN
const publishVehicle = async (req, res) => {
  try {
    const vehicle = await VehicleModel.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    // security check
    if (vehicle.seller_id.toString() !== (req.user._id || req.user.id).toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    vehicle.status = "Pending";
    await vehicle.save();

    res.status(200).json({
      message: "Vehicle sent for admin approval",
      data: vehicle
    });

  } catch (error) {
    res.status(500).json({
      message: "Error publishing vehicle",
      error: error.message
    });
  }
};


const approveVehicle = async (req, res) => {
  try {
    const vehicle = await VehicleModel.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    vehicle.status = "Approved";
    await vehicle.save();

    res.status(200).json({
      message: "Vehicle approved",
      data: vehicle
    });

  } catch (error) {
    res.status(500).json({
      message: "Error approving vehicle",
      error: error.message
    });
  }
};

const rejectVehicle = async (req, res) => {
  try {
    const vehicle = await VehicleModel.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    vehicle.status = "Rejected";
    await vehicle.save();

    res.status(200).json({
      message: "Vehicle rejected",
      data: vehicle
    });

  } catch (error) {
    res.status(500).json({
      message: "Error rejecting vehicle",
      error: error.message
    });
  }
};


const getPendingVehicles = async (req, res) => {
  try {

    const vehicles = await VehicleModel.find({ status: "Pending" });

    res.status(200).json({
      message: "Pending vehicles fetched",
      data: vehicles
    });

  } catch (error) {
    res.status(500).json({
      message: "Error fetching pending vehicles",
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
  publishVehicle,
  approveVehicle,
  rejectVehicle,
  getPendingVehicles
};