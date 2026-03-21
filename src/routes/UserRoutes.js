const router = require("express").Router();
const userController = require("../controllers/UserController");
const authMiddleWare = require("../middleware/AuthMiddleware");
const roleMiddleWare = require("../middleware/RoleMiddleware");

router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);
router.post("/google-signin", userController.googleSignin);

router.use(authMiddleWare);

router.get("/", roleMiddleWare("admin"), userController.getAllUsers);
router.delete("/:id", roleMiddleWare("admin"), userController.deleteUser);

module.exports = router;