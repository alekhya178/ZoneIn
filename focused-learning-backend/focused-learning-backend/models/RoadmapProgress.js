const mongoose = require("mongoose");

const roadmapProgressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  roadmap: { type: mongoose.Schema.Types.ObjectId, ref: "Roadmap", required: true },
  roadmapTitle: { type: String, required: true },
  currentStep: { type: Number, default: 0 },
  totalSteps: { type: Number, required: true },
  lastAccessedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("RoadmapProgress", roadmapProgressSchema);
