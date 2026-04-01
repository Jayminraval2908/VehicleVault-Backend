const TestDriveModel = require("../models/TestDriveModel");

// BOOK TEST DRIVE
const bookTestDrive = async (req, res) => {
  try {
    const booking = await TestDriveModel.create({
      ...req.body,
      buyer_id: req.user._id || req.user.id, // Remains to associate the record with the user
    });

    res.status(201).json({ 
      message: "Test drive booked successfully", 
      data: booking 
    });

  } catch (error) {
    res.status(500).json({ 
      message: "Error booking test drive", 
      error: error.message 
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

// UPDATE TEST DRIVE STATUS
// const updateTestDriveStatus = async (req, res) => {
//  try {
//     const { vehicle_id, preferred_date, preferred_time, location } = req.body;

//     // 🚩 Check 1: Is req.user.id coming from AuthMiddleware?
//     const buyer_id = req.user.id || req.user._id; 

//     if (!buyer_id) {
//       return res.status(401).json({ message: "User not authenticated" });
//     }

//     const newBooking = new TestDrive({
//       vehicle_id,
//       buyer_id,
//       preferred_date,
//       preferred_time,
//       location,
//       status: "pending" // Default status
//     });

//     await newBooking.save();
//     res.status(201).json({ success: true, data: newBooking });
//   } catch (error) {
//     // 🚩 This is what triggers the 500 error in your console
//     console.error("Booking Error:", error); 
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

const updateTestDriveStatus = async (req, res) => {
  try {
    const { status } = req.body; // e.g., { "status": "Confirmed" }
    
    const updatedBooking = await TestDriveModel.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("vehicle_id");

    if (!updatedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json({ success: true, data: updatedBooking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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
  updateTestDriveStatus,
  deleteBooking,
};