const mongoose = require("mongoose");
const TestDriveModel = require("../models/TestDriveModel");
const VehicleModel = require("../models/VehicleModel");

// BOOK TEST DRIVE
const bookTestDrive = async (req, res) => {
  try {
    const { vehicle_id, preferred_date, preferred_time, location } = req.body;

    const buyer_id = req.user._id || req.user.id;

    // ✅ VALIDATION
    if (!vehicle_id || !preferred_date || !preferred_time) {
      return res.status(400).json({
        message: "Vehicle, date and time are required",
      });
    }

    // ✅ VALID OBJECT ID CHECK
    if (!mongoose.Types.ObjectId.isValid(vehicle_id)) {
      return res.status(400).json({
        message: "Invalid vehicle ID",
      });
    }

    // ✅ FIND VEHICLE
    const vehicle = await VehicleModel.findById(vehicle_id);

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    // ✅ CREATE BOOKING (NO STATUS — schema will handle default)
    const booking = await TestDriveModel.create({
      vehicle_id,
      preferred_date,
      preferred_time,
      location,
      buyer_id,
      seller_id: vehicle.seller_id,
    });

    res.status(201).json({
      message: "Test drive booked successfully",
      data: booking,
    });

  } catch (error) {
    console.error("🔥 BOOKING ERROR:", error);

    res.status(500).json({
      message: "Error booking test drive",
      error: error.message,
    });
  }
};
// GET ALL BOOKINGS
const getAllBookings = async (req, res) => {
  try {
    const bookings = await TestDriveModel.find()
      .populate("buyer_id")
      .populate("vehicle_id");

    res.status(200).json({ 
      message: "Bookings fetched successfully", 
      data: bookings 
    });

  } catch (error) {
    res.status(500).json({ 
      message: "Error fetching bookings", 
      error: error.message 
    });
  }
};

// GET BOOKING BY ID
const getBookingById = async (req, res) => {
  try {
    const booking = await TestDriveModel.findById(req.params.id)
      .populate("vehicle_id")
      .populate("buyer_id");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json(booking);

  } catch (error) {
    res.status(500).json({ 
      message: "Error fetching booking", 
      error: error.message 
    });
  }
};

// GET BUYER BOOKINGS
const getBuyerBookings = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const bookings = await TestDriveModel.find({ buyer_id: userId })
      .populate("vehicle_id")
      .sort({preferred_date: 1});

    res.status(200).json({ 
      message: "Bookings fetched", 
      data: bookings 
    });

  } catch (error) {
    res.status(500).json({ 
      message: "Error fetching bookings", 
      error: error.message 
    });
  }
};

const getSellerBookings = async (req, res) => {
  try {
    const sellerId = req.user._id || req.user.id;

    const bookings = await TestDriveModel.find({ seller_id: sellerId })
      .populate("vehicle_id")
      .populate("buyer_id")
      .sort({ preferred_date: 1 });

    res.status(200).json({
      message: "Seller bookings fetched",
      data: bookings,
    });

  } catch (error) {
    res.status(500).json({
      message: "Error fetching seller bookings",
      error: error.message,
    });
  }
};  

const updateTestDriveStatus = async (req, res) => {
  try {
    let { status } = req.body;

    // ✅ VALIDATION (VERY IMPORTANT)
    const allowedStatus = ["Pending", "Approved", "Completed", "Cancelled"];

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    // normalize input
    status = status.toLowerCase();

    if (status === "approved") status = "Approved";
    else if (status === "cancelled") status = "Cancelled";
    else if (status === "completed") status = "Completed";
    else if (status === "pending") status = "Pending";
    else {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const updatedBooking = await TestDriveModel.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("vehicle_id");

    if (!updatedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json({
      message: "Status updated successfully",
      data: updatedBooking,
    });

  } catch (error) {
    console.error("🔥 STATUS UPDATE ERROR:", error); // VERY IMPORTANT
    res.status(500).json({
      message: "Error updating status",
      error: error.message,
    });
  }
};

// DELETE BOOKING
const deleteBooking = async (req, res) => {
  try {
    const deleted = await TestDriveModel.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json({ 
      message: "Booking deleted successfully", 
      data: deleted 
    });
    
  } catch (error) {
    res.status(500).json({ 
      message: "Error deleting booking", 
      error: error.message 
    });
  }
};

module.exports = {
  bookTestDrive,
  getAllBookings,
  getBookingById,
  getBuyerBookings,
  getSellerBookings,
  updateTestDriveStatus,
  deleteBooking,
};