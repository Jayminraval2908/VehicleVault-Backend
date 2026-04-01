const InquiryModel = require("../models/InquiriesModel");

// SEND INQUIRY
const sendInquiry = async (req, res) => {
  try {
    const inquiry = await InquiryModel.create({
      ...req.body,
      buyer_id: req.user._id, // Still using logged-in user ID for the record
    });

    res.status(201).json({
      message: "Inquiry sent successfully",
      data: inquiry,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error sending inquiry",
      error: error.message,
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
    const inquiries = await InquiryModel.find({ buyer_id: req.user._id })
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
    const inquiries = await InquiryModel.find({ buyer_id: req.user._id }) // OR we set req.params.buyerId
      .populate("vehicle_id");

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

module.exports = {
  sendInquiry,
  getAllInquiries,
  getInquiryById,
  getBuyerInquiries,
  getVehicleInquiries,
  getMyInquiries,
  updateInquiry,
  deleteInquiry,
};