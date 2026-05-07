const express = require("express");

const router = express.Router();

// Save note
router.post("/", (req, res) => {
  res.json({
    success: true,
    message: "Note saved",
  });
});

// Get notes
router.get("/", (req, res) => {
  res.json({
    success: true,
    notes: [],
  });
});

module.exports = router;