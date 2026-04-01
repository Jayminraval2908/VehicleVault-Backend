const User = require("../models/UserModel");
const Vehicle = require("../models/VehicleModel");
const Inquiry = require("../models/InquiriesModel");
const Offer = require("../models/OfferModel");

// ==========================================
// 🔥 DASHBOARD STATS (UPDATED)
// ==========================================
exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalVehicles,
      totalInquiries,
      pendingVehicles,
      blockedUsers,

      // ✅ TOTAL REVENUE
      revenueData,

      // ✅ MONTHLY REVENUE (FOR GRAPH)
      revenueByMonth
    ] = await Promise.all([
      User.countDocuments(),
      Vehicle.countDocuments(),
      Inquiry.countDocuments(),

      // ⚠️ FIX: Your schema doesn't have "Pending"
      Vehicle.countDocuments({ status: "Available" }),

      User.countDocuments({ status: "block" }),

      // 🔥 TOTAL REVENUE
      Offer.aggregate([
        { $match: { status: "accepted" } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$offered_amount" }
          }
        }
      ]),

      // 🔥 MONTHLY REVENUE GRAPH
      Offer.aggregate([
        { $match: { status: "accepted" } },
        {
          $group: {
            _id: { $month: "$createdAt" },
            revenue: { $sum: "$offered_amount" }
          }
        },
        { $sort: { "_id": 1 } }
      ])
    ]);

    const totalRevenue = revenueData[0]?.totalRevenue || 0;

    // ✅ FORMAT CHART DATA
    const chartData = revenueByMonth.map(r => ({
      name: `Month ${r._id}`,
      revenue: r.revenue
    }));

    // ==========================================
    // 🔥 RECENT ACTIVITY
    // ==========================================
    const recentOffers = await Offer.find()
      .populate("vehicle_id buyer_id")
      .sort({ createdAt: -1 })
      .limit(5);

    const recentInquiries = await Inquiry.find()
      .populate("vehicle_id buyer_id")
      .sort({ createdAt: -1 })
      .limit(5);

    const recentActivities = [
      ...recentOffers.map(o => ({
        type: "offer",
        message: `${o.buyer_id?.firstName || "User"} offered ₹${o.offered_amount} on ${o.vehicle_id?.make || ""} ${o.vehicle_id?.model || ""}`,
        time: o.createdAt
      })),
      ...recentInquiries.map(i => ({
        type: "inquiry",
        message: `${i.buyer_id?.firstName || "User"} inquired about ${i.vehicle_id?.make || ""} ${i.vehicle_id?.model || ""}`,
        time: i.createdAt
      }))
    ]
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 6);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalVehicles,
        totalInquiries,
        totalRevenue,
        pendingVehicles,
        blockedUsers,
        chartData,          // 🔥 NEW
        recentActivities
      }
    });

  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ message: error.message });
  }
};


// ==========================================
// 👥 USER MANAGEMENT (UNCHANGED - GOOD)
// ==========================================

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.blockUser = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { status: "block" });
    res.json({ message: "User blocked successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.unblockUser = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { status: "active" });
    res.json({ message: "User unblocked successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ==========================================
// 🚗 VEHICLE MANAGEMENT (FIXED STATUS)
// ==========================================

exports.getPendingVehicles = async (req, res) => {
  try {
    // ⚠️ FIX: Your schema doesn't have Pending
    const vehicles = await Vehicle.find({ status: "Available" })
      .populate("seller_id", "firstName email");

    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.approveVehicle = async (req, res) => {
  try {
    await Vehicle.findByIdAndUpdate(req.params.id, { status: "Available" });
    res.json({ message: "Vehicle approved successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.rejectVehicle = async (req, res) => {
  try {
    await Vehicle.findByIdAndDelete(req.params.id); // Better than "Rejected"
    res.json({ message: "Vehicle rejected & removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteVehicle = async (req, res) => {
  try {
    await Vehicle.findByIdAndDelete(req.params.id);
    res.json({ message: "Vehicle deleted by admin" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ==========================================
// 💰 OFFER MANAGEMENT (GOOD)
// ==========================================

exports.getAllOffers = async (req, res) => {
  try {
    const offers = await Offer.find()
      .populate("buyer_id", "firstName email")
      .populate("vehicle_id", "make model price");

    res.json(offers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateOfferStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    await Offer.findByIdAndUpdate(req.params.id, { status });

    res.json({ message: `Offer ${status}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ==========================================
// 📩 INQUIRY MANAGEMENT (GOOD)
// ==========================================

exports.getAllInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find()
      .populate("buyer_id", "firstName email")
      .populate("vehicle_id", "make model");

    res.json(inquiries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteInquiry = async (req, res) => {
  try {
    await Inquiry.findByIdAndDelete(req.params.id);
    res.json({ message: "Inquiry deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};