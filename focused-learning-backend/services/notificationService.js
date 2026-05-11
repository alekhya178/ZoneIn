const cron = require('node-cron');
const User = require('../models/User');
const Session = require('../models/Session');
const { 
  sendStudyReminderEmail, 
  sendBreakReminderEmail, 
  sendWeeklyReportEmail,
  sendStreakMilestoneEmail 
} = require('./mailService');

/**
 * Initialize all automated notification jobs
 */
const initNotificationJobs = () => {
  console.log("🚀 Initializing Notification Jobs...");

  // JOB 1: Daily Study Reminders (Run every minute)
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      
      // Convert current time to string matching "HH:MM AM/PM" (e.g., "07:00 PM")
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const currentTimeString = `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
      
      console.log(`🔍 Checking for study reminders at: ${currentTimeString}`);

      const usersToRemind = await User.find({
        "notifications.dailyStudyReminder": true,
        "notifications.dailyReminderTime": currentTimeString
      });

      if (usersToRemind.length > 0) {
        console.log(`⏰ Sending study reminders to ${usersToRemind.length} users...`);
        for (const user of usersToRemind) {
          console.log(`📧 Sending study reminder to: ${user.email}`);
          await sendStudyReminderEmail(user.email, user.name);
        }
      }
    } catch (error) {
      console.error("❌ Cron Job Error (Daily Reminder):", error);
    }

  });

  // JOB 2: Session Break Reminders (Run every 5 minutes)
  cron.schedule('*/5 * * * *', async () => {
    try {
      console.log("🔍 Checking for active sessions needing break reminders...");
      // Find all active, non-paused sessions
      const activeSessions = await Session.find({ 
        isActive: true, 
        isPaused: false 
      }).populate('user');

      console.log(`📡 Found ${activeSessions.length} active sessions.`);

      const now = new Date();

      for (const session of activeSessions) {
        if (!session.user || !session.user.notifications?.sessionBreakReminder) continue;

        // Parse interval (e.g., "45 Minutes" -> 45)
        const intervalText = session.user.notifications.breakInterval || "45 Minutes";
        const intervalMinutes = parseInt(intervalText) || 45;

        const startTime = new Date(session.startTime);
        const lastReminder = session.lastBreakReminderAt ? new Date(session.lastBreakReminderAt) : startTime;
        
        const minutesSinceStart = Math.floor((now - startTime) / 60000);
        const minutesSinceLastReminder = Math.floor((now - lastReminder) / 60000);

        console.log(`⏳ Session: ${session.user.name} | Active: ${minutesSinceStart}m | Last Reminder: ${minutesSinceLastReminder}m ago`);

        // Send reminder if user has been studying longer than interval
        // and we haven't sent a reminder in the last 'intervalMinutes'
        if (minutesSinceStart >= intervalMinutes && (minutesSinceLastReminder >= intervalMinutes || !session.lastBreakReminderAt)) {
          console.log(`☕ Sending break reminder to ${session.user.name} (${session.user.email})`);
          
          await sendBreakReminderEmail(session.user.email, session.user.name);
          
          // Update session to mark reminder as sent
          session.lastBreakReminderAt = now;
          await session.save();
        }
      }
    } catch (error) {
      console.error("❌ Cron Job Error (Break Reminder):", error);
    }
  });
  
  // JOB 3: Weekly Progress Reports (Run every Sunday at 9 PM)
  cron.schedule('0 21 * * 0', async () => {
    try {
      console.log("📊 Generating Weekly Progress Reports...");
      const users = await User.find({ "notifications.weeklyProgressReport": true });
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      for (const user of users) {
        const sessions = await Session.find({
          user: user._id,
          createdAt: { $gte: oneWeekAgo },
          isActive: false
        });

        if (sessions.length > 0) {
          const totalMinutes = sessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
          const totalFocus = sessions.reduce((acc, s) => acc + (s.focusScore || 0), 0);
          const focusScore = Math.round(totalFocus / sessions.length);

          await sendWeeklyReportEmail(user.email, user.name, {
            totalMinutes,
            focusScore,
            sessionsCount: sessions.length
          });
        }
      }
    } catch (error) {
      console.error("❌ Cron Job Error (Weekly Report):", error);
    }
  });

};

module.exports = { initNotificationJobs };
