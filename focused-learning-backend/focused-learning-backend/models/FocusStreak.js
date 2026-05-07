const mongoose = require("mongoose");

const focusStreakSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  currentStreakDays: { type: Number, default: 0 },
  lastStudyDate: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model("FocusStreak", focusStreakSchema);
