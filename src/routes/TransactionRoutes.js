const router = require("express").Router();
const TransactionController = require("../controllers/TransactionController");
const authMiddleWare = require("../middleware/AuthMiddleware");
const roleMiddleWare = require("../middleware/RoleMiddleware");

router.use(authMiddleWare);

router.post("/create", roleMiddleWare("buyer", "admin"), TransactionController.createTransaction);

router.get("/", roleMiddleWare("admin"), TransactionController.getAllTransactions);
router.get("/my-history", roleMiddleWare("buyer", "admin"), TransactionController.getBuyerTransactions);
router.get("/:id", roleMiddleWare("buyer", "seller", "admin"), TransactionController.getTransactionById);

router.put("/update/:id", roleMiddleWare("admin"), TransactionController.updateTransactionStatus);
router.delete("/:id", roleMiddleWare("admin"), TransactionController.deleteTransaction);

module.exports = router;