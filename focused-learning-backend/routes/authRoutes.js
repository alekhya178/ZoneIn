const express = require("express");
const router = express.Router();
const { 
  register, login, getMe, sync, 
  sendPasswordOTP, verifyPasswordOTP, resetPasswordWithOTP,
  sendDeleteAccountOTP, deleteAccountWithOTP
} = require("../controllers/authController");
const protect = require("../middleware/auth").protect;

// Define the endpoints
router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.post("/sync", sync);
router.post("/send-password-otp", sendPasswordOTP);
router.post("/verify-password-otp", verifyPasswordOTP);
router.post("/reset-password-with-otp", resetPasswordWithOTP);
router.post("/send-delete-otp", protect, sendDeleteAccountOTP);
router.post("/delete-account", protect, deleteAccountWithOTP);

module.exports = router;