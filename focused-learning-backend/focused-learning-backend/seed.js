require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const User = require("./models/User");
const Session = require("./models/Session");
const Roadmap = require("./models/Roadmap");
const RoadmapProgress = require("./models/RoadmapProgress");
const RecentActivity = require("./models/RecentActivity");
const FocusStreak = require("./models/FocusStreak");
const SubtopicProgress = require("./models/SubtopicProgress");

const seedDatabase = async () => {
  await connectDB();
  
  try {
    await User.deleteMany();
    await Session.deleteMany();
    await Roadmap.deleteMany();
    await RoadmapProgress.deleteMany();
    await RecentActivity.deleteMany();
    await FocusStreak.deleteMany();
    await SubtopicProgress.deleteMany();

    const user = await User.create({
      name: "John Doe",
      email: "john@example.com",
      password: "password123",
      totalStudyMinutes: 1250,
      focusStreak: 12,
      lastStudyDate: new Date()
    });

    const roadmap = await Roadmap.create({
      user: user._id,
      goal: "Learn React and Node",
      topics: [
        { title: "React Basics", isCompleted: true, order: 1 },
        { title: "React Hooks", isCompleted: true, order: 2 },
        { title: "Node & Express", isCompleted: false, order: 3 }
      ],
      isActive: true
    });

    await RoadmapProgress.create({
      user: user._id,
      roadmap: roadmap._id,
      roadmapTitle: roadmap.goal,
      currentStep: 3,
      totalSteps: 6,
      lastAccessedAt: new Date()
    });

    await FocusStreak.create({
      user: user._id,
      currentStreakDays: 12,
      lastStudyDate: new Date()
    });

    await RecentActivity.create({
      user: user._id,
      activityType: "watched",
      title: "React Hooks Tutorial",
      description: "Watched for 20m",
      occurredAt: new Date(Date.now() - 3600000)
    });

    await RecentActivity.create({
      user: user._id,
      activityType: "note_added",
      title: "Added note on useEffect",
      occurredAt: new Date(Date.now() - 7200000)
    });

    await RecentActivity.create({
      user: user._id,
      activityType: "session_completed",
      title: "Completed Study Session",
      description: "Focus Score: 88",
      occurredAt: new Date(Date.now() - 86400000)
    });

    for (let i = 0; i < 5; i++) {
      await Session.create({
        user: user._id,
        goal: `Session ${i+1}`,
        startTime: new Date(Date.now() - (i + 1) * 86400000),
        endTime: new Date(Date.now() - (i + 1) * 86400000 + 3600000),
        durationMinutes: 60,
        distractionsBlocked: i * 2,
        focusScore: Math.max(0, 100 - (i * 4)),
        isActive: false,
        sessionSource: "web"
      });
    }

    console.log("Database seeded successfully");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedDatabase();
