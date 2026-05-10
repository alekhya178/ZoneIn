import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Calendar, Timer, Award, TrendingUp, Zap, ChevronDown } from 'lucide-react';
import { fetchApi } from '../api';

const NotificationSettings = () => {
  const [settings, setSettings] = useState({
    dailyStudyReminder: true,
    dailyReminderTime: "07:00 PM",
    sessionBreakReminder: true,
    breakInterval: "45 Minutes",
    goalCompletionNotification: true,
    weeklyProgressReport: true,
    studyStreakAlerts: true
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await fetchApi('/settings/notifications');
        if (data) setSettings(data);
      } catch (err) {
        console.error("Failed to load notification settings", err);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleToggle = async (key) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    try {
      await fetchApi('/settings/notifications', {
        method: 'PUT',
        body: JSON.stringify(newSettings)
      });
    } catch (err) {
      console.error("Failed to update settings", err);
    }
  };

  const handleSelectChange = async (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    try {
      await fetchApi('/settings/notifications', {
        method: 'PUT',
        body: JSON.stringify(newSettings)
      });
    } catch (err) {
      console.error("Failed to update settings", err);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8 pb-12"
    >
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Notification Settings</h1>
        <p className="text-gray-400">Manage how and when you receive notifications.</p>
      </div>

      <div className="grid gap-6">
        {/* Study Reminders Card */}
        <section className="bg-card/30 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -translate-y-16 translate-x-16 blur-3xl group-hover:bg-primary/10 transition-colors"></div>
          
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Bell className="w-5 h-5 text-primaryLight" />
            Study Reminders
          </h2>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-primary/20 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primaryLight" />
                </div>
                <div>
                  <h3 className="text-white font-medium">Daily Study Reminder</h3>
                  <p className="text-xs text-gray-400">Remind me daily to study</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={settings.dailyStudyReminder}
                  onChange={() => handleToggle('dailyStudyReminder')}
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-[0_0_10px_rgba(139,92,246,0.3)]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Timer className="w-5 h-5 text-primaryLight" />
                </div>
                <div>
                  <h3 className="text-white font-medium">Reminder Time</h3>
                  <p className="text-xs text-gray-400">Set your preferred time for reminders</p>
                </div>
              </div>
              <div className="relative group/select">
                <select 
                  value={settings.dailyReminderTime}
                  onChange={(e) => handleSelectChange('dailyReminderTime', e.target.value)}
                  className="bg-card border border-white/10 text-white text-sm rounded-xl focus:ring-primary focus:border-primary block w-32 p-2.5 appearance-none cursor-pointer outline-none hover:border-primary/50 transition-colors"
                >
                  {["06:00 AM", "07:00 AM", "08:00 AM", "06:00 PM", "07:00 PM", "08:00 PM", "09:00 PM", "10:00 PM"].map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none group-hover/select:text-primary transition-colors" />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-primary/20 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Timer className="w-5 h-5 text-primaryLight" />
                </div>
                <div>
                  <h3 className="text-white font-medium">Session Break Reminder</h3>
                  <p className="text-xs text-gray-400">Remind me to take breaks</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={settings.sessionBreakReminder}
                  onChange={() => handleToggle('sessionBreakReminder')}
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-[0_0_10px_rgba(139,92,246,0.3)]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Timer className="w-5 h-5 text-primaryLight" />
                </div>
                <div>
                  <h3 className="text-white font-medium">Break Interval</h3>
                  <p className="text-xs text-gray-400">Frequency of break reminders</p>
                </div>
              </div>
              <div className="relative group/select">
                <select 
                  value={settings.breakInterval}
                  onChange={(e) => handleSelectChange('breakInterval', e.target.value)}
                  className="bg-card border border-white/10 text-white text-sm rounded-xl focus:ring-primary focus:border-primary block w-36 p-2.5 appearance-none cursor-pointer outline-none hover:border-primary/50 transition-colors"
                >
                  {["25 Minutes", "45 Minutes", "60 Minutes", "90 Minutes"].map(val => (
                    <option key={val} value={val}>{val}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none group-hover/select:text-primary transition-colors" />
              </div>
            </div>
          </div>
        </section>

        {/* Progress Notifications Card */}
        <section className="bg-card/30 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -translate-y-16 translate-x-16 blur-3xl group-hover:bg-primary/10 transition-colors"></div>
          
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primaryLight" />
            Progress Notifications
          </h2>

          <div className="space-y-6">
            {[
              { key: 'goalCompletionNotification', title: 'Goal Completion', desc: 'Notify me when I complete a goal', icon: Award },
              { key: 'weeklyProgressReport', title: 'Weekly Progress Report', desc: 'Send me weekly progress reports', icon: Zap },
              { key: 'studyStreakAlerts', title: 'Study Streak Alerts', desc: 'Notify me about my study streaks', icon: Zap }
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-primary/20 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-primaryLight" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{item.title}</h3>
                    <p className="text-xs text-gray-400">{item.desc}</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={settings[item.key]}
                    onChange={() => handleToggle(item.key)}
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-[0_0_10px_rgba(139,92,246,0.3)]"></div>
                </label>
              </div>
            ))}
          </div>
        </section>
      </div>
    </motion.div>
  );
};

export default NotificationSettings;
