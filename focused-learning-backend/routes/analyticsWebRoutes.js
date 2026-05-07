const express = require("express");
const router = express.Router();
const Session = require("../models/Session");
const RoadmapProgress = require("../models/RoadmapProgress");
const RecentActivity = require("../models/RecentActivity");
const protect = require("../middleware/auth").protect;

// GET /api/analytics/summary
router.get("/summary", protect, async (req, res, next) => {
  try {
    const sessions = await Session.find({ user: req.user._id });
    
    // Calculate overall stats
    let totalStudyMinutes = 0;
    let distractionsBlocked = 0;
    let totalScore = 0;

    sessions.forEach(s => {
      totalStudyMinutes += (s.durationMinutes || 0);
      distractionsBlocked += (s.distractionsBlocked || 0);
      totalScore += (s.focusScore || 0);
    });

    const avgFocusScore = sessions.length > 0 ? Math.round(totalScore / sessions.length) : 0;
    
    // Calculate weekly change
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    
    let thisWeekMinutes = 0;
    let lastWeekMinutes = 0;
    let thisWeekScoreSum = 0;
    let lastWeekScoreSum = 0;
    let thisWeekSessionsCount = 0;
    let lastWeekSessionsCount = 0;
    let thisWeekDistractions = 0;
    
    sessions.forEach(s => {
      const d = new Date(s.startTime);
      if (d >= oneWeekAgo && d <= now) {
        thisWeekMinutes += (s.durationMinutes || 0);
        thisWeekScoreSum += (s.focusScore || 0);
        thisWeekDistractions += (s.distractionsBlocked || 0);
        thisWeekSessionsCount++;
      } else if (d >= twoWeeksAgo && d < oneWeekAgo) {
        lastWeekMinutes += (s.durationMinutes || 0);
        lastWeekScoreSum += (s.focusScore || 0);
        lastWeekSessionsCount++;
      }
    });

    const thisWeekAvgScore = thisWeekSessionsCount > 0 ? Math.round(thisWeekScoreSum / thisWeekSessionsCount) : 0;
    const lastWeekAvgScore = lastWeekSessionsCount > 0 ? Math.round(lastWeekScoreSum / lastWeekSessionsCount) : 0;
    
    const weeklyStudyHoursChange = ((thisWeekMinutes - lastWeekMinutes) / 60).toFixed(1);
    const weeklyFocusScoreChange = thisWeekAvgScore - lastWeekAvgScore;

    // Get roadmap topics completed count
    const roadmaps = await RoadmapProgress.find({ user: req.user._id });
    let topicsCompleted = 0;
    let totalTopics = 0;
    roadmaps.forEach(r => {
      topicsCompleted += (r.currentStep || 0);
      totalTopics += (r.totalSteps || 0);
    });

    res.json({
      totalStudyHours: `${Math.floor(totalStudyMinutes / 60)}h ${totalStudyMinutes % 60}m`,
      focusScore: avgFocusScore,
      distractionsBlocked,
      topicsCompleted,
      totalTopics: totalTopics || 1, // avoid division by zero
      weeklyStudyHoursChange: parseFloat(weeklyStudyHoursChange),
      weeklyFocusScoreChange,
      weeklyDistractionsChange: thisWeekDistractions
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/analytics/weekly-hours
router.get("/weekly-hours", protect, async (req, res, next) => {
  try {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 is Sunday
    const diffToMonday = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    
    const startOfWeek = new Date(now.setDate(diffToMonday));
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const sessions = await Session.find({
      user: req.user._id,
      startTime: { $gte: startOfWeek, $lte: endOfWeek }
    });

    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const dailyMinutes = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };

    sessions.forEach(s => {
      let d = new Date(s.startTime).getDay();
      let dayName = d === 0 ? "Sun" : days[d - 1]; // map JS getDay (0=Sun) to our array
      dailyMinutes[dayName] += (s.durationMinutes || 0);
    });

    const data = days.map(day => ({
      day: day,
      hours: parseFloat((dailyMinutes[day] / 60).toFixed(1))
    }));

    res.json(data);
  } catch (error) {
    next(error);
  }
});

// GET /api/analytics/monthly-hours
router.get("/monthly-hours", protect, async (req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const sessions = await Session.find({
      user: req.user._id,
      startTime: { $gte: startOfMonth, $lte: endOfMonth }
    });

    // Group by week of the month (Week 1, Week 2, etc.)
    const weeklyMinutes = {};
    
    sessions.forEach(s => {
      const date = new Date(s.startTime);
      const weekNumber = Math.ceil(date.getDate() / 7);
      const key = `Week ${weekNumber}`;
      if (!weeklyMinutes[key]) weeklyMinutes[key] = 0;
      weeklyMinutes[key] += (s.durationMinutes || 0);
    });

    // Generate up to 5 weeks for the month
    const totalDaysInMonth = endOfMonth.getDate();
    const maxWeeks = Math.ceil(totalDaysInMonth / 7);
    
    const data = [];
    for (let i = 1; i <= maxWeeks; i++) {
      const key = `Week ${i}`;
      data.push({
        week: key,
        hours: parseFloat(((weeklyMinutes[key] || 0) / 60).toFixed(1)),
        goal: 10 // Arbitrary target line
      });
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
});

// GET /api/analytics/current-roadmap
router.get("/current-roadmap", protect, async (req, res, next) => {
  try {
    const progress = await RoadmapProgress.findOne({ user: req.user._id }).sort({ lastAccessedAt: -1 });
    if (!progress) {
      return res.json({ title: "No active roadmap", currentStep: 0, totalSteps: 0 });
    }
    res.json(progress);
  } catch (error) {
    next(error);
  }
});

// GET /api/analytics/recent-activity
router.get("/recent-activity", protect, async (req, res, next) => {
  try {
    const activities = await RecentActivity.find({ user: req.user._id })
      .sort({ occurredAt: -1 })
      .limit(30);
    res.json(activities);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
