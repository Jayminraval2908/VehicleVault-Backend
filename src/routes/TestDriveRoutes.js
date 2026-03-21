const router = require("express").Router();
const testDriveController = require("../controllers/TestDriveController");
const authMiddleWare = require("../middleware/AuthMiddleware");
const roleMiddleWare = require("../middleware/RoleMiddleware");

router.use(authMiddleWare);

router.post("/book", roleMiddleWare("buyer", "admin"), testDriveController.bookTestDrive);

router.get("/", roleMiddleWare("admin"), testDriveController.getAllBookings);
router.get("/my-bookings", roleMiddleWare("buyer"), testDriveController.getBuyerBookings);
router.get("/details/:id", roleMiddleWare("buyer", "seller", "admin"), testDriveController.getBookingById);

router.put("/status/:id", roleMiddleWare("seller", "admin"), testDriveController.updateTestDriveStatus);
router.delete("/:id", roleMiddleWare("buyer", "admin"), testDriveController.deleteBooking);

module.exports = router;