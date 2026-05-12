const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    firstName: String,
    lastName: String,
    preferredName: String,
    contact: String,
    state: String,
    country: String,
    bio: {
      type: String,
      default: "Learning to grow and growing to learn."
    },
    avatar: {
      type: String,
      default: null
    },
    username: {
      type: String,
      unique: true,
      sparse: true,
      trim: true
    },
    currentGoal: {
      type: String,
      default: "Web Development"
    },
    appearance: {
      theme: { type: String, default: 'dark' },
      accentColor: { type: String, default: '#8b5cf6' },
      fontSize: { type: String, default: 'medium' }
    },
    notifications: {
      dailyStudyReminder: { type: Boolean, default: true },
      dailyReminderTime: { type: String, default: "07:00 PM" },
      sessionBreakReminder: { type: Boolean, default: true },
      breakInterval: { type: String, default: "45 Minutes" },
      goalCompletionNotification: { type: Boolean, default: true },
      weeklyProgressReport: { type: Boolean, default: true },
      studyStreakAlerts: { type: Boolean, default: true }
    },
    privacy: {
      activeTracking: { type: Boolean, default: true },
      watchHistoryTracking: { type: Boolean, default: true },
      storeAISummaries: { type: Boolean, default: true },
      personalizedRecommendations: { type: Boolean, default: false }
    },
    privacySettings: {
      activeTracking: { type: Boolean, default: true },
      watchHistoryTracking: { type: Boolean, default: true }
    },
    advanced: {
      focusMode: { type: Boolean, default: false },
      pomodoroEnabled: { type: Boolean, default: true },
      sessionDuration: { type: Number, default: 50 },
      shortBreakDuration: { type: Number, default: 10 },
      longBreakDuration: { type: Number, default: 20 }
    },
    dailyGoal: {
      type: String,
      default: "60" // 60 minutes
    },
    learningGoals: {
      type: [String],
      default: ["Master New Skills", "Stay Consistent"]
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      minlength: 6,
    },
    firebaseUid: {
      type: String,
      unique: true,
      sparse: true, // Allow multiple nulls for legacy users
    },
    totalStudyMinutes: {
      type: Number,
      default: 0,
    },
    focusStreak: {
      type: Number,
      default: 0,
    },
    lastStudyDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password || !enteredPassword) return false;
  try {
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (e) {
    return false;
  }
};

module.exports = mongoose.model("User", userSchema);