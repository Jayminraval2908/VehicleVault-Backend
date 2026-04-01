const router = require("express").Router();

const adminController = require("../controllers/AdminController");
const authMiddleWare = require("../middleware/AuthMiddleware");
const roleMiddleWare = require("../middleware/RoleMiddleware");

// 🔐 Apply authentication + admin role to ALL routes
router.use(authMiddleWare, roleMiddleWare("admin"));


// ==========================================
// 📊 DASHBOARD
// ==========================================
router.get("/dashboard", adminController.getDashboardStats);


// ==========================================
// 👥 USER MANAGEMENT
// ==========================================
router.get("/users", adminController.getAllUsers);

router.put("/user/block/:id", adminController.blockUser);
router.put("/user/unblock/:id", adminController.unblockUser);

router.delete("/user/:id", adminController.deleteUser);


// ==========================================
// 🚗 VEHICLE MANAGEMENT
// ==========================================
router.get("/vehicles/pending", adminController.getPendingVehicles);

router.put("/vehicle/approve/:id", adminController.approveVehicle);
router.put("/vehicle/reject/:id", adminController.rejectVehicle);

router.delete("/vehicle/:id", adminController.deleteVehicle);


// ==========================================
// 💰 OFFER MANAGEMENT
// ==========================================
router.get("/offers", adminController.getAllOffers);

router.put("/offer/:id", adminController.updateOfferStatus);


// ==========================================
// 📩 INQUIRY MANAGEMENT
// ==========================================
router.get("/inquiries", adminController.getAllInquiries);

router.delete("/inquiry/:id", adminController.deleteInquiry);


module.exports = router;