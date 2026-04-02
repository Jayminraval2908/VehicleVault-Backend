const router = require("express").Router();
const InquiryController = require("../controllers/InquiryController");
const authMiddleWare = require("../middleware/AuthMiddleware");
const roleMiddleWare = require("../middleware/RoleMiddleware");

router.post("/send", authMiddleWare, roleMiddleWare("buyer","seller"), InquiryController.sendInquiry);

router.use(authMiddleWare);
router.get("/", roleMiddleWare("admin"), InquiryController.getAllInquiries);
router.get("/my-inquiries",roleMiddleWare("buyer"),InquiryController.getMyInquiries);
router.get("/seller",roleMiddleWare("seller"),InquiryController.getSellerInquiries);
router.get("/buyer/:buyerId", roleMiddleWare("buyer", "admin"), InquiryController.getBuyerInquiries);
router.get("/vehicle/:vehicleId", roleMiddleWare("seller", "admin"), InquiryController.getVehicleInquiries);
router.get("/:id", roleMiddleWare("buyer", "seller", "admin"), InquiryController.getInquiryById);

router.put("/:id", roleMiddleWare("buyer", "admin"), InquiryController.updateInquiry);
router.put("/reply/:id", roleMiddleWare("seller"), InquiryController.replyToInquiry);

router.delete("/:id", roleMiddleWare("buyer", "admin"), InquiryController.deleteInquiry);

module.exports = router;