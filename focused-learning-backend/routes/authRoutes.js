const express = require("express");
const router = express.Router();
const { register, login, getMe } = require("../controllers/authController");
const protect = require("../middleware/auth").protect;

// Define the endpoints
router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);

module.exports = router;