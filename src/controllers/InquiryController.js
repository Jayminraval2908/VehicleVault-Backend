const InquiryModel = require("../models/InquiriesModel");
const VehicleModel = require("../models/VehicleModel");
const mongoose = require("mongoose")

// SEND INQUIRY
// const sendInquiry = async (req, res) => {
//   try {
//     const { vehicle_id, message } = req.body;
//     const buyerId = req.user._id || req.user.id;

//     console.log("REQ BODY:", req.body);

//     // ✅ VALIDATION
//     if (!vehicle_id || !message) {
//       return res.status(400).json({
//         message: "vehicle_id and message are required"
//       });
//     }

//     // ✅ CHECK VALID OBJECT ID
//     const mongoose = require("mongoose");
//     if (!mongoose.Types.ObjectId.isValid(vehicle_id)) {
//       return res.status(400).json({
//         message: "Invalid vehicle ID"
//       });
//     }

//     // ✅ FIND VEHICLE
//     const vehicle = await VehicleModel.findById(vehicle_id);

//     if (!vehicle) {
//       return res.status(404).json({
//         message: "Vehicle not found"
//       });
//     }

//     // ✅ CREATE INQUIRY
//     const inquiry = await InquiryModel.create({
//       vehicle_id,
//       message,
//       buyer_id: buyerId,
//       seller_id: vehicle.seller_id
//     });

//     res.status(201).json({
//       message: "Inquiry sent successfully",
//       data: inquiry
//     });

//   } catch (error) {
//     console.error("🔥 SEND INQUIRY ERROR:", error); // VERY IMPORTANT
//     res.status(500).json({
//       message: "Error sending inquiry",
//       error: error.message
//     });
//   }
// };

const sendInquiry = async (req, res) => {
  try {
    const { vehicle_id, message } = req.body;
    const buyerId = req.user._id || req.user.id;

    if (!vehicle_id || !message) {
      return res.status(400).json({ message: "vehicle_id and message are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(vehicle_id)) {
      return res.status(400).json({ message: "Invalid vehicle ID" });
    }

    const vehicle = await VehicleModel.findById(vehicle_id);

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });


    }

    console.log("Vehicle found. Seller ID is:", vehicle.seller_id);

    // 🚩 FIX: Extract seller_id properly (handles both populated and unpopulated cases)
    const targetSellerId = vehicle.seller_id._id || vehicle.seller_id;

    const inquiry = await InquiryModel.create({
      vehicle_id,
      message,
      buyer_id: buyerId,
      seller_id: targetSellerId // 🚩 This ensures the seller actually receives it
    });

    res.status(201).json({
      message: "Inquiry sent successfully",
      data: inquiry
    });

  } catch (error) {
    console.error("🔥 SEND INQUIRY ERROR:", error);
    res.status(500).json({
      message: "Error sending inquiry",
      error: error.message
    });
  }
};

// GET ALL INQUIRIES
const getAllInquiries = async (req, res) => {
  try {
    const inquiries = await InquiryModel.find()
      .populate("buyer_id")
      .populate("vehicle_id");

    res.status(200).json({
      message: "Inquiries fetched successfully",
      data: inquiries,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching inquiries",
      error: error.message,
    });
  }
};

// GET MY INQUIRIES (for logged-in buyer)
const getMyInquiries = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const inquiries = await InquiryModel.find({ buyer_id: userId })
      .populate("vehicle_id"); // optional: add "buyer_id" if needed

    res.status(200).json({
      message: "My inquiries fetched successfully",
      data: inquiries,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching my inquiries",
      error: error.message,
    });
  }
};

// GET INQUIRY BY ID
const getInquiryById = async (req, res) => {
  try {
    const inquiry = await InquiryModel.findById(req.params.id)
      .populate("buyer_id")
      .populate("vehicle_id");

    if (!inquiry) {
      return res.status(404).json({ message: "Inquiry not found" });
    }

    res.status(200).json(inquiry);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching inquiry",
      error: error.message,
    });
  }
};

// GET BUYER INQUIRIES
const getBuyerInquiries = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const inquiries = await InquiryModel.find({ buyer_id: userId }) // OR we set req.params.buyerId
      .populate("vehicle_id")
      .populate("seller_id", "name email phone") // 🚩 Added seller contact details
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Buyer inquiries fetched",
      data: inquiries,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching buyer inquiries",
      error: error.message,
    });
  }
};

// GET VEHICLE INQUIRIES
const getVehicleInquiries = async (req, res) => {
  try {
    const inquiries = await InquiryModel.find({ vehicle_id: req.params.vehicleId })
      .populate("buyer_id")
      .populate("vehicle_id");

    res.status(200).json({
      message: "Vehicle inquiries fetched",
      data: inquiries,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching vehicle inquiries",
      error: error.message,
    });
  }
};


//GET SELLER INQUIRY
// const getSellerInquiries = async (req, res) => {
//   try {
//     const userId = req.user._id || req.user.id;
//     const inquiries = await InquiryModel.find({
//       seller_id: userId
//     }).populate("vehicle_id buyer_id");

//     res.status(200).json({
//       message: "Seller inquiries fetched",
//       data: inquiries
//     });

//   } catch (error) {
//     res.status(500).json({
//       message: "Error fetching inquiries",
//       error: error.message
//     });
//   }
// };


const getSellerInquiries = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    
    // 🚩 Added .sort({ createdAt: -1 }) so newest messages appear first
    const inquiries = await InquiryModel.find({
      seller_id: userId
    })
    .populate("vehicle_id")
    .populate("buyer_id")
    .sort({ createdAt: -1 }); 

    res.status(200).json({
      message: "Seller inquiries fetched",
      data: inquiries
    });

  } catch (error) {
    res.status(500).json({
      message: "Error fetching inquiries",
      error: error.message
    });
  }
};

// UPDATE INQUIRY
const updateInquiry = async (req, res) => {
  try {
    const updated = await InquiryModel.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Inquiry not found" });
    }

    res.status(200).json({ 
      message: "Inquiry updated successfully", 
      data: updated 
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error updating inquiry", 
      error: error.message 
    });
  }
};

// DELETE INQUIRY
const deleteInquiry = async (req, res) => {
  try {
    const deleted = await InquiryModel.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Inquiry not found" });
    }

    res.status(200).json({ 
      message: "Inquiry deleted successfully", 
      data: deleted 
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error deleting inquiry", 
      error: error.message 
    });
  }
};


// REPLY TO INQUIRY (SELLER)
// const replyToInquiry = async (req, res) => {
//   try {
//     const { message } = req.body;

//     const inquiry = await InquiryModel.findById(req.params.id);

//     if (!inquiry) {
//       return res.status(404).json({
//         message: "Inquiry not found"
//       });
//     }

//     // ✅ CHECK: only seller can reply
//     const userId = req.user._id || req.user.id;

//     if (inquiry.seller_id.toString() !== userId.toString()) {
//       return res.status(403).json({
//         message: "Not authorized to reply to this inquiry"
//       });
//     }

//     // ✅ UPDATE reply
//     inquiry.reply = message;

//     // ✅ OPTIONAL: change status
//     inquiry.status = "Accepted";

//     await inquiry.save();

//     res.status(200).json({
//       message: "Reply sent successfully",
//       data: inquiry
//     });

//   } catch (error) {
//     res.status(500).json({
//       message: "Error replying to inquiry",
//       error: error.message
//     });
//   }
// };


// // ✅ REPLY TO INQUIRY (Updated Comparison Logic)
// const replyToInquiry = async (req, res) => {
//   try {
//     const { message } = req.body;
//     const inquiry = await InquiryModel.findById(req.params.id);

//     if (!inquiry) {
//       return res.status(404).json({ message: "Inquiry not found" });
//     }

//     const userId = req.user._id || req.user.id;

//     // 🚩 FIX: Use .toString() for safe ObjectId comparison
//     if (inquiry.seller_id.toString() !== userId.toString()) {
//       return res.status(403).json({
//         message: "Not authorized to reply to this inquiry"
//       });
//     }

//     inquiry.reply = message;
//     inquiry.status = "Accepted";

//     await inquiry.save();

//     res.status(200).json({
//       message: "Reply sent successfully",
//       data: inquiry
//     });

//   } catch (error) {
//     res.status(500).json({
//       message: "Error replying to inquiry",
//       error: error.message
//     });
//   }
// };



// ✅ UPDATED: REPLY TO INQUIRY (No manual text needed)
const replyToInquiry = async (req, res) => {
  try {
    // 🚩 We now look for 'status' in the body instead of 'message'
    const { status } = req.body; 
    const inquiry = await InquiryModel.findById(req.params.id);

    if (!inquiry) {
      return res.status(404).json({ message: "Inquiry not found" });
    }

    const userId = req.user._id || req.user.id;

    if (inquiry.seller_id.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "Not authorized to respond to this inquiry"
      });
    }

    // 🚩 AUTO-GENERATE reply based on status
    const autoReply = status === "Accepted" 
      ? "Yes, I accept your offer. Please see my contact details below." 
      : "I'm sorry, I cannot accept this offer at this time.";

    inquiry.reply = autoReply;
    inquiry.status = status; // "Accepted" or "Rejected"

    await inquiry.save();

    res.status(200).json({
      message: `Inquiry ${status} successfully`,
      data: inquiry
    });

  } catch (error) {
    res.status(500).json({
      message: "Error processing response",
      error: error.message
    });
  }
};

module.exports = {
  sendInquiry,
  getAllInquiries,
  getInquiryById,
  getBuyerInquiries,
  getVehicleInquiries,
  getMyInquiries,
  getSellerInquiries,
  updateInquiry,
  deleteInquiry,
  replyToInquiry
};