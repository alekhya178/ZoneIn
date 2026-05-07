const express = require("express");

const router = express.Router();

// Update topic progress
router.put("/:roadmapId/topic/:topicId", (req, res) => {
  res.json({
    success: true,
    message: "Topic progress updated",
  });
});

// Get progress
router.get("/:roadmapId", (req, res) => {
  res.json({
    success: true,
    progress: 45,
  });
});

module.exports = router;