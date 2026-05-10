import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Timer, Clock, ChevronDown, ShieldAlert } from 'lucide-react';
import { fetchApi } from '../api';

const AdvancedSettings = () => {
  const [settings, setSettings] = useState({
    focusMode: false,
    pomodoroEnabled: true,
    sessionDuration: 50,
    shortBreakDuration: 10,
    longBreakDuration: 20
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await fetchApi('/settings/advanced');
        if (data) setSettings(data);
      } catch (err) {
        console.error("Failed to load advanced settings", err);
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
      await fetchApi('/settings/advanced', {
        method: 'PUT',
        body: JSON.stringify(newSettings)
      });
      
      // Notify extension if focusMode changed
      if (key === 'focusMode') {
        window.postMessage({ type: "ZONEIN_TOGGLE_FOCUS", isFocusMode: newSettings.focusMode }, "*");
      }
    } catch (err) {
      console.error("Failed to update settings", err);
    }
  };

  const handleSelectChange = async (key, value) => {
    const newSettings = { ...settings, [key]: parseInt(value) };
    setSettings(newSettings);
    try {
      await fetchApi('/settings/advanced', {
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
        <h1 className="text-3xl font-bold text-white mb-2">Advanced Settings</h1>
        <p className="text-gray-400">Advanced preferences for power users.</p>
      </div>

      <div className="grid gap-6">
        {/* Study Mode Card */}
        <section className="bg-card/30 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -translate-y-16 translate-x-16 blur-3xl group-hover:bg-primary/10 transition-colors"></div>
          
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Zap className="w-5 h-5 text-primaryLight" />
            Study Mode
          </h2>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-primary/20 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5 text-primaryLight" />
                </div>
                <div>
                  <h3 className="text-white font-medium">Focus Mode</h3>
                  <p className="text-xs text-gray-400">Enter full focus mode (hide everything)</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={settings.focusMode}
                  onChange={() => handleToggle('focusMode')}
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
                  <h3 className="text-white font-medium">Pomodoro Timer</h3>
                  <p className="text-xs text-gray-400">Use Pomodoro technique for better productivity</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={settings.pomodoroEnabled}
                  onChange={() => handleToggle('pomodoroEnabled')}
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-[0_0_10px_rgba(139,92,246,0.3)]"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { key: 'sessionDuration', title: 'Custom Session Duration', desc: 'Set custom study session duration', options: [25, 40, 50, 60, 90] },
                { key: 'shortBreakDuration', title: 'Short Break Duration', desc: 'Set short break duration', options: [5, 10, 15] },
                { key: 'longBreakDuration', title: 'Long Break Duration', desc: 'Set long break duration', options: [15, 20, 30] }
              ].map((item) => (
                <div key={item.key} className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col justify-between gap-4">
                  <div>
                    <h3 className="text-white text-sm font-medium">{item.title}</h3>
                    <p className="text-[10px] text-gray-500 mb-2">{item.desc}</p>
                  </div>
                  <div className="relative group/select">
                    <select 
                      value={settings[item.key]}
                      onChange={(e) => handleSelectChange(item.key, e.target.value)}
                      className="bg-card border border-white/10 text-white text-xs rounded-xl focus:ring-primary focus:border-primary block w-full p-2.5 appearance-none cursor-pointer outline-none hover:border-primary/50 transition-colors"
                    >
                      {item.options.map(val => (
                        <option key={val} value={val}>{val} Minutes</option>
                      ))}
                    </select>
                    <ChevronDown className="w-3 h-3 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none group-hover/select:text-primary transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </motion.div>
  );
};

export default AdvancedSettings;
