const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const Session = require("../models/Session");
const Roadmap = require("../models/Roadmap");
const Note = require("../models/Note");
const VideoWatch = require("../models/VideoWatch");
const TopicEngagement = require("../models/TopicEngagement");
const RecentActivity = require("../models/RecentActivity");
const User = require("../models/User");

// 1. GET /api/data/export - Export all user data
router.get("/export", protect, async (req, res) => {
  try {
    const [sessions, roadmaps, notes, watchHistory, engagements, activity] = await Promise.all([
      Session.find({ user: req.user._id }),
      Roadmap.find({ user: req.user._id }),
      Note.find({ user: req.user._id }),
      VideoWatch.find({ user: req.user._id }),
      TopicEngagement.find({ user: req.user._id }),
      RecentActivity.find({ user: req.user._id }),
    ]);

    const exportData = {
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        createdAt: req.user.createdAt,
      },
      stats: {
        totalStudyMinutes: req.user.totalStudyMinutes,
        focusStreak: req.user.focusStreak,
      },
      studySessions: sessions,
      learningRoadmaps: roadmaps,
      personalNotes: notes,
      videoWatchHistory: watchHistory,
      topicEngagements: engagements,
      recentActivity: activity,
      exportedAt: new Date().toISOString(),
    };

    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", "attachment; filename=focuslearn_data_export.json");
    res.json(exportData);
  } catch (error) {
    res.status(500).json({ message: "Failed to export data", error: error.message });
  }
});

// 2. DELETE /api/data/clear-watch-history - Reset watch progress
router.post("/clear-watch-history", protect, async (req, res) => {
  try {
    // Delete all video watch records
    await VideoWatch.deleteMany({ user: req.user._id });

    // Delete 'watched' entries from recent activity
    await RecentActivity.deleteMany({ user: req.user._id, activityType: "watched" });

    // Reset watch percentage and engagement scores on all topic engagements
    await TopicEngagement.updateMany(
      { user: req.user._id },
      { 
        $set: { 
          watchPercentage: 0,
          videos: [] // Clear video specific tracking in engagement
        }
      }
    );

    // Recalculate engagement scores for all engagements
    const engagements = await TopicEngagement.find({ user: req.user._id });
    for (const eng of engagements) {
      eng.engagementScore = Math.min(100, Math.round(
        0 * 0.4 + eng.activeTimePercent * 0.3 + eng.quizScore * 0.3
      ));
      await eng.save();
    }

    res.json({ message: "Watch history cleared and progress reset." });
  } catch (error) {
    res.status(500).json({ message: "Failed to clear watch history", error: error.message });
  }
});

// 3. DELETE /api/data/delete-all-data - Wipe all app data
router.delete("/delete-all-data", protect, async (req, res) => {
  try {
    await Promise.all([
      Session.deleteMany({ user: req.user._id }),
      Roadmap.deleteMany({ user: req.user._id }),
      Note.deleteMany({ user: req.user._id }),
      VideoWatch.deleteMany({ user: req.user._id }),
      TopicEngagement.deleteMany({ user: req.user._id }),
      RecentActivity.deleteMany({ user: req.user._id }),
    ]);

    // Reset user stats in user model
    const user = await User.findById(req.user._id);
    if (user) {
      user.totalStudyMinutes = 0;
      user.focusStreak = 0;
      user.lastStudyDate = null;
      await user.save();
    }

    res.json({ message: "All application data has been permanently deleted." });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete data", error: error.message });
  }
});

module.exports = router;
