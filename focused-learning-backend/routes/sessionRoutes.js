const express = require("express");
const router = express.Router();
const { startSession, endSession, updateSessionProgress, getActiveSession } = require("../controllers/sessionController");
const { protect } = require("../middleware/auth");

router.post("/start", protect, startSession);
router.patch("/:id/end", protect, endSession);
router.patch("/:id/progress", protect, updateSessionProgress);
router.get("/active", protect, getActiveSession);

module.exports = router;