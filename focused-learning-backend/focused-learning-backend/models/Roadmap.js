const mongoose = require("mongoose");

// Each individual topic/step in the roadmap
const topicSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  order: { type: Number, required: true },         // Display order (1, 2, 3...)
  estimatedHours: { type: Number, default: 1 },
  isCompleted: { type: Boolean, default: false },
  completedAt: { type: Date, default: null },
});

const roadmapSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    goal: {
      type: String,
      required: [true, "Learning goal is required"],
      trim: true,
    },              // e.g. "Learn Python", "Master Machine Learning"
    description: {
      type: String,
      default: "",
    },
    topics: [topicSchema],
    isActive: {
      type: Boolean,
      default: true,   // The roadmap the extension is currently tracking
    },
    totalTopics: { type: Number, default: 0 },
    completedTopics: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Auto-calculate totals before saving
roadmapSchema.pre("save", function (next) {
  this.totalTopics = this.topics.length;
  this.completedTopics = this.topics.filter((t) => t.isCompleted).length;
  next();
});

module.exports = mongoose.model("Roadmap", roadmapSchema);