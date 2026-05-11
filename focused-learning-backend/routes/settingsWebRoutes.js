const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const User = require("../models/User");
const { sendStudyReminderEmail } = require("../services/mailService");

// 1. PUT /api/settings/profile
router.put("/profile", protect, async (req, res) => {
  try {
    const { name, email, username, currentGoal, bio } = req.body;
    
    // Check if username is taken by someone else
    if (username) {
      const existing = await User.findOne({ username, _id: { $ne: req.user._id } });
      if (existing) return res.status(400).json({ message: "Username already taken" });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = name || user.name;
    user.email = email || user.email;
    user.username = username || user.username;
    user.currentGoal = currentGoal || user.currentGoal;
    user.bio = bio || user.bio;

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 2. PUT /api/settings/password
router.put("/password", protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    console.log(`Password change request for user: ${req.user.email}`);

    const user = await User.findById(req.user._id).select("+password");
    if (!user) return res.status(404).json({ message: "User not found" });

    // If user has a password, verify it. 
    // (If they don't have one because of Social Login, we might need a different flow, 
    // but for now we follow the 'Old Password' requirement)
    if (user.password) {
      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        console.log("Invalid current password attempt");
        return res.status(401).json({ message: "Invalid current password" });
      }
    }

    user.password = newPassword;
    await user.save();
    
    console.log("Password updated successfully for", user.email);
    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Password Update Error:", error);
    res.status(500).json({ message: error.message });
  }
});

// 3. GET/PUT /api/settings/appearance
router.get("/appearance", protect, async (req, res) => {
  res.json(req.user.appearance || {});
});

router.put("/appearance", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.appearance = { ...user.appearance, ...req.body };
    await user.save();
    res.json(user.appearance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 4. GET/PUT /api/settings/notifications
router.get("/notifications", protect, async (req, res) => {
  res.json(req.user.notifications || {});
});

router.put("/notifications", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.notifications = { ...user.notifications, ...req.body };
    await user.save();
    res.json(user.notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/notifications/test", protect, async (req, res) => {
  try {
    await sendStudyReminderEmail(req.user.email, req.user.name);
    res.json({ success: true, message: "Test notification sent" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 5. GET/PUT /api/settings/privacy
router.get("/privacy", protect, async (req, res) => {
  res.json(req.user.privacy || {});
});

router.put("/privacy", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.privacy = { ...user.privacy, ...req.body };
    await user.save();
    res.json(user.privacy);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 6. GET/PUT /api/settings/advanced
router.get("/advanced", protect, async (req, res) => {
  res.json(req.user.advanced || {});
});

router.put("/advanced", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.advanced = { ...user.advanced, ...req.body };
    await user.save();
    res.json(user.advanced);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
