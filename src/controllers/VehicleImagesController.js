const VehicleImagesModel = require("../models/VehicleImagesModel");
const Imagekit = require("../utills/Imagekitutils");
const storageService = require("../services/StorageService");

// ADD IMAGE
const addImg = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const uploadResponse = await imagekit.upload({
      file: req.file.buffer, // Provided by Multer memoryStorage
      fileName: `vault_${Date.now()}_${req.file.originalname}`,
      folder: "/vehicle_vault"
    });

    const img = await VehicleImagesModel.create({
      vehicle_id: req.body.vehicle_id,
      image_url: uploadResponse.url,
      file_id:uploadResponse.fileId,
      seller_id: req.user._id,
      image_type:req.body.image_type || "gallery",
      is_primary:req.body.is_primary === 'true'
    });

    res.status(201).json({ 
      message: "Image uploaded successfully", 
      data: img 
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error uploading image", 
      error: error.message 
    });
  }
};

// MULTIPLE IMAGES
const uploadMultipleImages = async (req, res) => {
  try {
    const images = req.files.map(file => ({
      vehicle_id: req.body.vehicle_id,
      image_url: file.path,
      seller_id: req.user.id,
    }));

    const saved = await VehicleImagesModel.insertMany(images);

    res.status(201).json({ 
      message: "Images uploaded successfully", 
      data: saved 
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error uploading images", 
      error: error.message 
    });
  }
};

// GET ALL IMAGES
const getAllImages = async (req, res) => {
  try {
    const images = await VehicleImagesModel.find();
    res.status(200).json({ 
      message: "Images fetched successfully", 
      data: images 
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error fetching images", 
      error: error.message 
    });
  }
};

// GET IMAGES BY VEHICLE
const getImagesByVehicle = async (req, res) => {
  try {
    const images = await VehicleImagesModel.find({ vehicle_id: req.params.vehicleId });
    res.status(200).json({ 
      message: "Images fetched for vehicle", 
      data: images 
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error fetching images", 
      error: error.message 
    });
  }
};

// UPDATE IMAGE
const updateImage = async (req, res) => {
  try {
    const updated = await VehicleImagesModel.findByIdAndUpdate(
      req.params.id,
      { image_url: req.file.path },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Image not found" });

    res.status(200).json({ 
      message: "Image updated successfully", 
      data: updated 
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error updating image", 
      error: error.message 
    });
  }
};

// DELETE IMAGE
const deleteImage = async (req, res) => {
  try {
    // 1. Find the image to get file_id and verify ownership
    const image = await VehicleImagesModel.findById(req.params.id);

    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }

    // 2. SECURITY: Only the owner or an admin can delete
    if (image.seller_id.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized: You don't own this image" });
    }

    // 3. PHYSICAL DELETE: Call the storage service
    if (image.file_id) {
      await storageService.deleteFile(image.file_id);
    }

    // 4. DATABASE DELETE: Remove the record
    const deletedRecord = await VehicleImagesModel.findByIdAndDelete(req.params.id);

    res.status(200).json({ 
      message: "Image successfully removed from Vault and ImageKit", 
      data: deletedRecord 
    });

  } catch (error) {
    res.status(500).json({ 
      message: "Error during deletion process", 
      error: error.message 
    });
  }
};


module.exports = {
  addImg,
  uploadMultipleImages,
  getAllImages,
  getImagesByVehicle,
  updateImage,
  deleteImage,
};