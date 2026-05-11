import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Calendar, Timer, Award, TrendingUp, Zap, ChevronDown } from 'lucide-react';
import { fetchApi } from '../../api';

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

  // Helper to convert "07:00 PM" to "19:00"
  const formatTimeTo24h = (time12h) => {
    if (!time12h) return "07:00";
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') hours = '00';
    if (modifier === 'PM') hours = parseInt(hours, 10) + 12;
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  };

  // Helper to convert "19:00" to "07:00 PM"
  const formatTimeTo12h = (time24h) => {
    if (!time24h) return "07:00 PM";
    let [hours, minutes] = time24h.split(':');
    const modifier = parseInt(hours, 10) >= 12 ? 'PM' : 'AM';
    hours = parseInt(hours, 10) % 12 || 12;
    return `${hours.toString().padStart(2, '0')}:${minutes} ${modifier}`;
  };

  const handleTimeChange = async (e) => {
    const time24h = e.target.value;
    const time12h = formatTimeTo12h(time24h);
    handleSelectChange('dailyReminderTime', time12h);
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

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-primary/20 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Timer className="w-5 h-5 text-primaryLight" />
                </div>
                <div>
                  <h3 className="text-white font-medium">Reminder Time</h3>
                  <p className="text-xs text-gray-400">Set your preferred time for reminders</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-card rounded-xl p-1 border border-white/10">
                  <select 
                    value={settings.dailyReminderTime.split(':')[0]} 
                    onChange={(e) => {
                      const [h, m_ampm] = settings.dailyReminderTime.split(':');
                      handleSelectChange('dailyReminderTime', `${e.target.value}:${m_ampm}`);
                    }}
                    className="bg-transparent text-white text-xs font-bold p-1.5 outline-none cursor-pointer"
                  >
                    {Array.from({length: 12}, (_, i) => (i + 1).toString().padStart(2, '0')).map(h => (
                      <option key={h} value={h} className="bg-surface">{h}</option>
                    ))}
                  </select>
                  <span className="text-gray-500 font-bold">:</span>
                  <select 
                    value={settings.dailyReminderTime.split(':')[1].split(' ')[0]} 
                    onChange={(e) => {
                      const [h, m_ampm] = settings.dailyReminderTime.split(':');
                      const ampm = m_ampm.split(' ')[1];
                      handleSelectChange('dailyReminderTime', `${h}:${e.target.value} ${ampm}`);
                    }}
                    className="bg-transparent text-white text-xs font-bold p-1.5 outline-none cursor-pointer"
                  >
                    {["00", "15", "30", "45"].map(m => (
                      <option key={m} value={m} className="bg-surface">{m}</option>
                    ))}
                  </select>
                  <select 
                    value={settings.dailyReminderTime.split(' ')[1]} 
                    onChange={(e) => {
                      const [h_m, ampm] = settings.dailyReminderTime.split(' ');
                      handleSelectChange('dailyReminderTime', `${h_m} ${e.target.value}`);
                    }}
                    className="bg-primary/20 text-primaryLight text-[10px] font-black p-1.5 rounded-lg outline-none cursor-pointer"
                  >
                    <option value="AM" className="bg-surface text-white">AM</option>
                    <option value="PM" className="bg-surface text-white">PM</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="pt-4 mt-4 border-t border-white/5">
              <button 
                onClick={async () => {
                  try {
                    await fetchApi('/settings/notifications/test', { method: 'POST' });
                    alert("Test notification sent to your email!");
                  } catch (e) {
                    alert("Failed to send test: " + e.message);
                  }
                }}
                className="w-full py-3 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs font-bold rounded-xl transition-all border border-dashed border-white/10 hover:border-white/20"
              >
                Send Test Notification to {settings.email || 'your email'}
              </button>
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

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-primary/20 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Timer className="w-5 h-5 text-primaryLight" />
                </div>
                <div>
                  <h3 className="text-white font-medium">Break Interval</h3>
                  <p className="text-xs text-gray-400">Frequency of break reminders</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative group/select">
                  <select 
                    value={["25 Minutes", "45 Minutes", "60 Minutes", "90 Minutes"].includes(settings.breakInterval) ? settings.breakInterval : "Custom"}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "Custom") {
                        // Set a default numeric value if switching to custom
                        handleSelectChange('breakInterval', "15 Minutes");
                      } else {
                        handleSelectChange('breakInterval', val);
                      }
                    }}
                    className="bg-card border border-white/10 text-white text-sm rounded-xl focus:ring-primary focus:border-primary block w-36 p-2.5 appearance-none cursor-pointer outline-none hover:border-primary/50 transition-colors"
                  >
                    {["25 Minutes", "45 Minutes", "60 Minutes", "90 Minutes"].map(val => (
                      <option key={val} value={val}>{val}</option>
                    ))}
                    <option value="Custom">Custom...</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none group-hover/select:text-primary transition-colors" />
                </div>
                
                {(!["25 Minutes", "45 Minutes", "60 Minutes", "90 Minutes"].includes(settings.breakInterval)) && (
                  <div className="flex items-center gap-2 animate-fade-in">
                    <input 
                      type="number"
                      min="1"
                      max="120"
                      value={parseInt(settings.breakInterval) || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val) handleSelectChange('breakInterval', `${val} Minutes`);
                      }}
                      className="w-20 bg-card border border-white/10 rounded-xl p-2.5 text-sm text-white focus:border-primary outline-none"
                    />
                    <span className="text-xs text-gray-500 font-bold">Min</span>
                  </div>
                )}
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
              { key: 'goalCompletionNotification', title: 'Roadmap Completion', desc: 'Notify me when I complete an entire roadmap', icon: Award },
              { key: 'weeklyProgressReport', title: 'Weekly Progress Report', desc: 'Send me a summary of my study time and achievements each week', icon: Zap }
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