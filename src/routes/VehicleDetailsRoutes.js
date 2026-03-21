const router = require("express").Router();
const vehicleDetailsController = require("../controllers/VehicleDetailsController");
const authMiddleWare = require("../middleware/AuthMiddleware");
const roleMiddleWare = require("../middleware/RoleMiddleware");

router.get("/vehicle/:vehicleId", vehicleDetailsController.getVehicleDetailsByVehicle);
router.get("/:id", vehicleDetailsController.getVehicleDetailsById);

router.use(authMiddleWare);

router.get("/", vehicleDetailsController.getAllVehicleDetails);
router.post("/add", roleMiddleWare("seller", "admin"), vehicleDetailsController.addVehicleDetails);
router.put("/:id", roleMiddleWare("seller", "admin"), vehicleDetailsController.updateVehicleDetails);
router.delete("/:id", roleMiddleWare("seller", "admin"), vehicleDetailsController.deleteVehicleDetails);

module.exports = router;