const mongoose = require("mongoose");

const recentActivitySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  activityType: { type: String, enum: ["watched", "note_added", "session_completed"], required: true },
  title: { type: String, required: true },
  description: { type: String, default: "" },
  occurredAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("RecentActivity", recentActivitySchema);
