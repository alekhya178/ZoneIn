const express = require("express");

const router = express.Router();

// Start session
router.post("/start", (req, res) => {
  res.json({
    success: true,
    sessionId: "session123",
    message: "Session started",
  });
});

// End session
router.post("/:id/end", (req, res) => {
  res.json({
    success: true,
    message: "Session ended",
  });
});

module.exports = router;