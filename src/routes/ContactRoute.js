const router = require("express").Router()
const contactController = require("../controllers/ContactController");

router.post("/", contactController.sendContactEmail);

module.exports = router;