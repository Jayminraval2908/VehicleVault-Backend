  const router = require("express").Router();
  const vehicleController = require("../controllers/VehicleController");
  const authMiddleWare = require("../middleware/AuthMiddleware");
  const roleMiddleWare = require("../middleware/RoleMiddleware");
  const upload = require("../middleware/UploadMiddleware");

  // ==========================
  // 🌐 PUBLIC ROUTES
  // ==========================
  router.get("/", vehicleController.getAllVehicles);
  router.get("/details/:id", vehicleController.getVehicleById);

  // ==========================
  // 👤 SELLER ROUTES
  // ==========================
  router.get(
    "/my-inventory",
    authMiddleWare,
    roleMiddleWare("seller"),
    vehicleController.getSellerVehicles
  );

  router.get(
    "/my-garage",
    authMiddleWare,
    roleMiddleWare("seller"),
    vehicleController.getMyVehicles
  )

  router.post(
    "/add",
    authMiddleWare,
    upload.array("images", 10),
    roleMiddleWare("seller", "admin"),
    vehicleController.addVehicle
  );

  // 🚀 NEW: Publish vehicle (draft → pending)
  router.patch(
    "/publish/:id",
    authMiddleWare,
    roleMiddleWare("seller"),
    vehicleController.publishVehicle
  );

  // ==========================
  // 🛠 COMMON (Seller/Admin)
  // ==========================
  router.put(
    "/:id",
    authMiddleWare,
    upload.array("images", 10),
    roleMiddleWare("seller", "admin"),
    vehicleController.updateVehicle
  );

  router.delete(
    "/:id",
    authMiddleWare,
    roleMiddleWare("seller", "admin"),
    vehicleController.deleteVehicle
  );

  // ==========================
  // 👨‍💼 ADMIN ROUTES
  // ==========================

  // 🔥 Get all pending vehicles
  router.get(
    "/pending",
    authMiddleWare,
    roleMiddleWare("admin"),
    vehicleController.getPendingVehicles
  );

  // ✅ Approve vehicle
  router.patch(
    "/approve/:id",
    authMiddleWare,
    roleMiddleWare("admin"),
    vehicleController.approveVehicle
  );

  // ❌ Reject vehicle  
  router.patch(
    "/reject/:id",
    authMiddleWare,
    roleMiddleWare("admin"),
    vehicleController.rejectVehicle
  );

  module.exports = router;