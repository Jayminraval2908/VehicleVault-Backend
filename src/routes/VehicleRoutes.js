const router = require("express").Router();
const vehicleController = require("../controllers/VehicleController");
const authMiddleWare = require("../middleware/AuthMiddleware");
const roleMiddleWare = require("../middleware/RoleMiddleware");

router.get("/", vehicleController.getAllVehicles);
router.get("/details/:id", vehicleController.getVehicleById);

router.use(authMiddleWare);

router.get("/my-inventory",roleMiddleWare("seller"), vehicleController.getSellerVehicles);
router.post("/add", roleMiddleWare("seller", "admin"), vehicleController.addVehicle);
router.put("/:id", roleMiddleWare("seller", "admin"), vehicleController.updateVehicle);
router.delete("/:id", roleMiddleWare("seller", "admin"), vehicleController.deleteVehicle);

module.exports = router;