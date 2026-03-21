const router = require("express").Router();
const inspectionReportController = require("../controllers/InspectionReportController");
const authMiddleWare = require("../middleware/AuthMiddleware");
const roleMiddleWare = require("../middleware/RoleMiddleware");

router.use(authMiddleWare);

router.post("/add", roleMiddleWare("seller", "admin"), inspectionReportController.addInspectionReport);
router.get("/", roleMiddleWare("admin"), inspectionReportController.getAllReports);
router.get("/vehicle/:vehicleId", roleMiddleWare("seller", "admin","buyer"), inspectionReportController.getVehicleReport);
router.get("/:id", roleMiddleWare("seller", "admin","buyer"), inspectionReportController.getReportById);

router.put("/:id", roleMiddleWare("seller", "admin"), inspectionReportController.updateInspectionReport);
router.delete("/:id", roleMiddleWare("admin"), inspectionReportController.deleteInspectionReport);

module.exports = router;