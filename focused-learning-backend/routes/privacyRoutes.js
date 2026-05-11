const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const User = require("../models/User");

// GET /api/privacy
router.get("/", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user.privacySettings || { activeTracking: true, watchHistoryTracking: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/privacy
router.patch("/", protect, async (req, res) => {
  try {
    const { activeTracking, watchHistoryTracking } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.privacySettings) {
      user.privacySettings = { activeTracking: true, watchHistoryTracking: true };
    }

    if (activeTracking !== undefined) user.privacySettings.activeTracking = activeTracking;
    if (watchHistoryTracking !== undefined) user.privacySettings.watchHistoryTracking = watchHistoryTracking;

    await user.save();
    res.json(user.privacySettings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
