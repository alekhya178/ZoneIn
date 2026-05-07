const Session = require("../models/Session");
const User = require("../models/User");
const Roadmap = require("../models/Roadmap");

// ─── Helper: get start of day ─────────────────────────────────
const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

// @desc    Main dashboard — all metrics in one call
// @route   GET /api/analytics/dashboard
// @access  Private
const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select("-password");

    // Active roadmap progress
    const activeRoadmap = await Roadmap.findOne({ user: userId, isActive: true });

    // All sessions (active and completed)
    const sessions = await Session.find({ user: userId });
    const completedSessions = sessions.filter(s => !s.isActive);
    const activeSession = sessions.find(s => s.isActive);

    // Total distractions blocked (all time)
    const totalDistractionsBlocked = sessions.reduce(
      (sum, s) => sum + (s.distractionsBlocked || 0),
      0
    );

    // Total study hours (convert minutes → hours, round to 1 decimal)
    const totalStudyHours = parseFloat(
      (user.totalStudyMinutes / 60).toFixed(1)
    );

    // Average focus score across completed sessions
    const avgFocusScore =
      completedSessions.length > 0
        ? Math.round(
            completedSessions.reduce((sum, s) => sum + (s.focusScore || 0), 0) / completedSessions.length
          )
        : 0;

    // Today's study time (including active session)
    const todaySessions = sessions.filter(
      (s) =>
        new Date(s.startTime) >= startOfDay(new Date())
    );
    const todayMinutes = todaySessions.reduce(
      (sum, s) => sum + (s.durationMinutes || 0),
      0
    );

    // Roadmap progress
    let roadmapProgress = null;
    if (activeRoadmap) {
      roadmapProgress = {
        roadmapId: activeRoadmap._id,
        goal: activeRoadmap.goal,
        totalTopics: activeRoadmap.totalTopics,
        completedTopics: activeRoadmap.completedTopics,
        progressPercent:
          activeRoadmap.totalTopics > 0
            ? Math.round(
                (activeRoadmap.completedTopics / activeRoadmap.totalTopics) * 100
              )
            : 0,
      };
    }

    res.json({
      focusStreak: user.focusStreak,
      totalStudyHours,
      totalDistractionsBlocked,
      avgFocusScore,
      todayMinutes,
      roadmapProgress,
      totalSessions: sessions.length,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Weekly study data — hours per day for the current week
// @route   GET /api/analytics/weekly
// @access  Private
const getWeeklyData = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Get start of this week (Monday)
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday
    const diffToMonday = (dayOfWeek === 0 ? 6 : dayOfWeek - 1);
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - diffToMonday);
    weekStart.setHours(0, 0, 0, 0);

    const sessions = await Session.find({
      user: userId,
      isActive: false,
      endTime: { $gte: weekStart },
    });

    // Build day-by-day breakdown
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const data = days.map((day, i) => {
      const dayDate = new Date(weekStart);
      dayDate.setDate(weekStart.getDate() + i);
      const nextDay = new Date(dayDate);
      nextDay.setDate(dayDate.getDate() + 1);

      const daySessions = sessions.filter((s) => {
        const end = new Date(s.endTime);
        return end >= dayDate && end < nextDay;
      });

      const minutesStudied = daySessions.reduce(
        (sum, s) => sum + (s.durationMinutes || 0),
        0
      );

      return {
        day,
        hours: parseFloat((minutesStudied / 60).toFixed(1)),
        minutes: minutesStudied,
      };
    });

    res.json({ weekStart, data });
  } catch (error) {
    next(error);
  }
};

// @desc    Monthly study data — hours per week for the current month
// @route   GET /api/analytics/monthly
// @access  Private
const getMonthlyData = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const sessions = await Session.find({
      user: userId,
      isActive: false,
      endTime: { $gte: monthStart },
    });

    // Split month into 4-5 weeks
    const weeks = [];
    let weekStart = new Date(monthStart);

    while (weekStart.getMonth() === now.getMonth()) {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);

      const weekSessions = sessions.filter((s) => {
        const end = new Date(s.endTime);
        return end >= weekStart && end < weekEnd;
      });

      const minutesStudied = weekSessions.reduce(
        (sum, s) => sum + (s.durationMinutes || 0),
        0
      );

      weeks.push({
        label: `Week ${weeks.length + 1}`,
        weekStart: new Date(weekStart),
        hours: parseFloat((minutesStudied / 60).toFixed(1)),
        minutes: minutesStudied,
      });

      weekStart.setDate(weekStart.getDate() + 7);
    }

    res.json({
      month: now.toLocaleString("default", { month: "long" }),
      year: now.getFullYear(),
      data: weeks,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboard, getWeeklyData, getMonthlyData };