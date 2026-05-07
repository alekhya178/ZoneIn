const mongoose = require("mongoose");

const subtopicProgressSchema = new mongoose.Schema({
  session: { type: mongoose.Schema.Types.ObjectId, ref: "Session", required: true },
  subtopicName: { type: String, required: true },
  isCompleted: { type: Boolean, default: false },
  completedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model("SubtopicProgress", subtopicProgressSchema);
