const router = require("express").Router();
const upload = require("../middleware/UploadMiddleware");
const vehicleImagesController = require("../controllers/VehicleImagesController");
const authMiddleWare = require("../middleware/AuthMiddleware");
const roleMiddleWare = require("../middleware/RoleMiddleware");

router.get("/", vehicleImagesController.getAllImages);
router.get("/vehicle/:vehicleId", vehicleImagesController.getImagesByVehicle);

router.use(authMiddleWare);

router.post("/upload", roleMiddleWare("seller", "admin"), upload.single("image"), vehicleImagesController.addImg);
router.post("/upload-multiple", roleMiddleWare("seller", "admin"), upload.array("images", 10), vehicleImagesController.uploadMultipleImages);
router.put("/:id", roleMiddleWare("seller", "admin"), upload.single("image"), vehicleImagesController.updateImage);
router.delete("/:id", roleMiddleWare("seller", "admin"), vehicleImagesController.deleteImage);


module.exports = router;