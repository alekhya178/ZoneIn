const express = require("express");

const router = express.Router();

// Dashboard analytics
router.get("/dashboard", (req, res) => {
  res.json({
    success: true,
    analytics: {
      totalStudyHours: 20,
      focusScore: 85,
      streak: 7,
    },
  });
});

module.exports = router;