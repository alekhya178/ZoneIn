const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    roadmap: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Roadmap",
      default: null,
    },
    goal: {
      type: String,
      default: "",        // e.g. "Python" — stored for quick display
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: {
      type: Date,
      default: null,
    },
    durationMinutes: {
      type: Number,
      default: 0,         // Calculated on session end
    },
    distractionsBlocked: {
      type: Number,
      default: 0,         // Sent from the Chrome Extension
    },
    videosWatched: {
      type: Number,
      default: 0,
    },
    focusScore: {
      type: Number,
      default: 0,         // Calculated: based on duration vs distractions
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sessionSource: {
      type: String,
      default: "web", // "web" or "extension"
    },
    subtopics: {
      type: Array,
      default: [],
    },
    targetDuration: {
      type: Number, // stored in seconds, nullable
      default: null,
    },
    isPaused: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Session", sessionSchema);