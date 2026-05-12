const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
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
    topicId: {
      type: String,
      default: null,      // Links note to a specific topic in the roadmap
    },
    videoId: {
      type: String,
      default: null,      // YouTube video ID
    },
    videoTitle: {
      type: String,
      default: "",
    },
    videoUrl: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      enum: ["ai_summary", "manual_note", "topic_notes", "personalized", "general"],
      default: "manual_note",
    },
    transcript: {
      type: String,
      default: "",
    },
    content: {
      type: String,
      required: [true, "Note content is required"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Note", noteSchema);