const router = require("express").Router();
const offerController = require("../controllers/OfferController");
const authMiddleWare = require("../middleware/AuthMiddleware");
const roleMiddleWare = require("../middleware/RoleMiddleware");

router.use(authMiddleWare);

router.post("/create", roleMiddleWare("buyer","seller"), offerController.createOffer);
router.get("/seller", roleMiddleWare("seller"), offerController.getSellerOffers);
router.get("/vehicle/:vehicleId", roleMiddleWare("seller", "admin"), offerController.getVehicleOffers);
router.get("/my-offers", roleMiddleWare("buyer", "admin"), offerController.getBuyerOffers);
router.get("/:id", roleMiddleWare("buyer", "seller", "admin"), offerController.getOfferById);

router.put("/:id", roleMiddleWare("seller", "admin"), offerController.updateOfferStatus);
router.delete("/:id", roleMiddleWare("buyer", "admin"), offerController.deleteOffer);

module.exports = router;