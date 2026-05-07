const Roadmap = require("../models/Roadmap");
const { generateRoadmap } = require("../services/aiService");

// @desc    Generate and save an AI-powered roadmap
// @route   POST /api/roadmap/generate
// @access  Private
const createRoadmap = async (req, res, next) => {
  try {
    const { goal } = req.body;
    if (!goal) {
      return res.status(400).json({ message: "Learning goal is required" });
    }

    // Set all other roadmaps to inactive when creating a new one
    await Roadmap.updateMany({ user: req.user._id }, { isActive: false });

    // Generate roadmap structure via AI
    const aiData = await generateRoadmap(goal);

    const roadmap = await Roadmap.create({
      user: req.user._id,
      goal,
      description: aiData.description,
      topics: aiData.topics,
      isActive: true,
    });

    res.status(201).json(roadmap);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all roadmaps for the logged-in user
// @route   GET /api/roadmap
// @access  Private
const getRoadmaps = async (req, res, next) => {
  try {
    const roadmaps = await Roadmap.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(roadmaps);
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single roadmap by ID
// @route   GET /api/roadmap/:id
// @access  Private
const getRoadmapById = async (req, res, next) => {
  try {
    const roadmap = await Roadmap.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!roadmap) {
      return res.status(404).json({ message: "Roadmap not found" });
    }

    res.json(roadmap);
  } catch (error) {
    next(error);
  }
};

// @desc    Get the currently active roadmap
// @route   GET /api/roadmap/active
// @access  Private
const getActiveRoadmap = async (req, res, next) => {
  try {
    const roadmap = await Roadmap.findOne({
      user: req.user._id,
      isActive: true,
    });

    if (!roadmap) {
      return res.status(404).json({ message: "No active roadmap found" });
    }

    res.json(roadmap);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a roadmap
// @route   DELETE /api/roadmap/:id
// @access  Private
const deleteRoadmap = async (req, res, next) => {
  try {
    const roadmap = await Roadmap.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!roadmap) {
      return res.status(404).json({ message: "Roadmap not found" });
    }

    res.json({ message: "Roadmap deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRoadmap,
  getRoadmaps,
  getRoadmapById,
  getActiveRoadmap,
  deleteRoadmap,
};