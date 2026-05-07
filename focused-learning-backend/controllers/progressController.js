const Roadmap = require("../models/Roadmap");

// @desc    Mark a topic as complete or incomplete (toggle)
// @route   PATCH /api/progress/:roadmapId/topic/:topicId
// @access  Private
const toggleTopicCompletion = async (req, res, next) => {
  try {
    const roadmap = await Roadmap.findOne({
      _id: req.params.roadmapId,
      user: req.user._id,
    });

    if (!roadmap) {
      return res.status(404).json({ message: "Roadmap not found" });
    }

    const topic = roadmap.topics.id(req.params.topicId);
    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }

    // Toggle completion state
    topic.isCompleted = !topic.isCompleted;
    topic.completedAt = topic.isCompleted ? new Date() : null;

    await roadmap.save(); // pre-save hook auto-updates completedTopics count

    if (topic.isCompleted) {
      const RecentActivity = require("../models/RecentActivity");
      await RecentActivity.create({
        user: req.user._id,
        activityType: "note_added",
        title: "Topic Completed",
        description: `Topic: ${topic.title}`,
        occurredAt: new Date()
      });
    }

    res.json({
      message: `Topic marked as ${topic.isCompleted ? "completed" : "incomplete"}`,
      topic,
      completedTopics: roadmap.completedTopics,
      totalTopics: roadmap.totalTopics,
      progressPercent: Math.round(
        (roadmap.completedTopics / roadmap.totalTopics) * 100
      ),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get full progress summary for a roadmap
// @route   GET /api/progress/:roadmapId
// @access  Private
const getProgress = async (req, res, next) => {
  try {
    const roadmap = await Roadmap.findOne({
      _id: req.params.roadmapId,
      user: req.user._id,
    });

    if (!roadmap) {
      return res.status(404).json({ message: "Roadmap not found" });
    }

    const completedTopics = roadmap.topics.filter((t) => t.isCompleted);
    const pendingTopics = roadmap.topics.filter((t) => !t.isCompleted);
    const progressPercent = roadmap.totalTopics > 0
      ? Math.round((roadmap.completedTopics / roadmap.totalTopics) * 100)
      : 0;

    res.json({
      roadmapId: roadmap._id,
      goal: roadmap.goal,
      totalTopics: roadmap.totalTopics,
      completedTopics: roadmap.completedTopics,
      pendingTopics: pendingTopics.length,
      progressPercent,
      topics: roadmap.topics.sort((a, b) => a.order - b.order),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { toggleTopicCompletion, getProgress };