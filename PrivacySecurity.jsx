import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, History, Save, Target, Download, Trash2, Lock, Smartphone, ChevronRight } from 'lucide-react';
import { fetchApi } from '../api';

const PrivacySecurity = () => {
  const [settings, setSettings] = useState({
    activeTracking: true,
    watchHistoryTracking: true,
    storeAISummaries: true,
    personalizedRecommendations: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await fetchApi('/settings/privacy');
        if (data) setSettings(data);
      } catch (err) {
        console.error("Failed to load privacy settings", err);
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
      await fetchApi('/settings/privacy', {
        method: 'PUT',
        body: JSON.stringify(newSettings)
      });
    } catch (err) {
      console.error("Failed to update settings", err);
    }
  };

  const handleExportData = () => {
    alert("Data export initiated. You will receive an email with your data shortly.");
  };

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear your watch history? This cannot be undone.")) {
      alert("Watch history cleared.");
    }
  };

  const handleDeleteData = () => {
    if (window.confirm("DANGER: This will permanently delete all your study data, summaries, and account history. Proceed?")) {
      alert("Data deletion requested.");
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
        <h1 className="text-3xl font-bold text-white mb-2">Privacy & Security</h1>
        <p className="text-gray-400">Manage your privacy settings and data security.</p>
      </div>

      <div className="grid gap-6">
        {/* Data & Privacy Card */}
        <section className="bg-card/30 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -translate-y-16 translate-x-16 blur-3xl group-hover:bg-primary/10 transition-colors"></div>
          
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primaryLight" />
            Data & Privacy
          </h2>

          <div className="space-y-4">
            {[
              { key: 'activeTracking', title: 'Active Tracking', desc: 'Allow tracking of your study activity', icon: Target },
              { key: 'watchHistoryTracking', title: 'Watch History Tracking', desc: 'Track watched videos for better insights', icon: History },
              { key: 'storeAISummaries', title: 'Store AI Summaries', desc: 'Store AI generated summaries and notes', icon: Save },
              { key: 'personalizedRecommendations', title: 'Personalized Recommendations', desc: 'Use data to provide personalized recommendations', icon: Target }
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

        {/* Data Management Card */}
        <section className="bg-card/30 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -translate-y-16 translate-x-16 blur-3xl group-hover:bg-primary/10 transition-colors"></div>
          
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-primaryLight" />
            Data Management
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Download className="w-5 h-5 text-primaryLight" />
                </div>
                <div>
                  <h3 className="text-white font-medium">Export My Data</h3>
                  <p className="text-xs text-gray-400">Download all your data and analytics</p>
                </div>
              </div>
              <button 
                onClick={handleExportData}
                className="px-6 py-2 border border-primary/30 text-primaryLight rounded-xl hover:bg-primary/10 transition-all font-medium text-sm"
              >
                Export
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <History className="w-5 h-5 text-primaryLight" />
                </div>
                <div>
                  <h3 className="text-white font-medium">Clear Watch History</h3>
                  <p className="text-xs text-gray-400">Clear all tracked watch history</p>
                </div>
              </div>
              <button 
                onClick={handleClearHistory}
                className="px-6 py-2 border border-white/10 text-gray-400 rounded-xl hover:bg-white/5 transition-all font-medium text-sm"
              >
                Clear
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="text-white font-medium">Delete All Data</h3>
                  <p className="text-xs text-gray-400">Permanently delete all your data</p>
                </div>
              </div>
              <button 
                onClick={handleDeleteData}
                className="px-6 py-2 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500/10 transition-all font-medium text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </section>

        {/* Security Card */}
        <section className="bg-card/30 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -translate-y-16 translate-x-16 blur-3xl group-hover:bg-primary/10 transition-colors"></div>
          
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Lock className="w-5 h-5 text-primaryLight" />
            Security
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primaryLight" />
                </div>
                <div>
                  <h3 className="text-white font-medium">Two-Factor Authentication</h3>
                  <p className="text-xs text-gray-400">Add extra layer of security to your account</p>
                </div>
              </div>
              <button className="px-6 py-2 bg-primary text-white rounded-xl hover:bg-primaryDark transition-all font-medium text-sm shadow-lg shadow-primary/20">
                Enable
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-primaryLight" />
                </div>
                <div>
                  <h3 className="text-white font-medium">Active Sessions</h3>
                  <p className="text-xs text-gray-400">Manage devices where you are logged in</p>
                </div>
              </div>
              <button className="flex items-center gap-2 px-6 py-2 border border-white/10 text-gray-400 rounded-xl hover:bg-white/5 transition-all font-medium text-sm">
                View <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      </div>
    </motion.div>
  );
};

export default PrivacySecurity;
