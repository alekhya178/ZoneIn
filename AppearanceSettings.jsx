import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, Palette, Type, Check, Bell, Search, Home, User, Settings, Zap } from 'lucide-react';
import { fetchApi } from '../api';

const AppearanceSettings = () => {
  const [settings, setSettings] = useState({
    theme: 'dark',
    accentColor: '#8b5cf6',
    fontSize: 'medium'
  });
  const [loading, setLoading] = useState(true);

  const colors = [
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Cyan', value: '#06b6d4' },
    { name: 'Green', value: '#10b981' },
    { name: 'Yellow', value: '#f59e0b' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Pink', value: '#ec4899' },
  ];

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await fetchApi('/settings/appearance');
        if (data) setSettings(data);
      } catch (err) {
        console.error("Failed to load appearance settings", err);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const updateSettings = async (updates) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    try {
      await fetchApi('/settings/appearance', {
        method: 'PUT',
        body: JSON.stringify(newSettings)
      });
      
      // Update global CSS variables for preview
      if (updates.accentColor) {
        document.documentElement.style.setProperty('--primary', updates.accentColor);
      }
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
      className="max-w-6xl mx-auto space-y-8 pb-12"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Appearance</h1>
          <p className="text-gray-400">Customize the look and feel of FocusLearn to match your style.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Theme Mode */}
          <section className="bg-card/30 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Palette className="w-5 h-5 text-primaryLight" />
              Theme Mode
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: 'dark', name: 'Dark Mode', desc: 'Best for low light', icon: Moon },
                { id: 'light', name: 'Light Mode', desc: 'Best for bright environment', icon: Sun },
                { id: 'purple', name: 'Purple Mode', desc: 'A soft purple experience', icon: Palette }
              ].map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => updateSettings({ theme: theme.id })}
                  className={`p-6 rounded-2xl border transition-all text-left group relative overflow-hidden ${
                    settings.theme === theme.id 
                      ? 'bg-primary/10 border-primary shadow-[0_0_20px_rgba(139,92,246,0.1)]' 
                      : 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10'
                  }`}
                >
                  <theme.icon className={`w-8 h-8 mb-4 transition-colors ${settings.theme === theme.id ? 'text-primary' : 'text-gray-500'}`} />
                  <h3 className="text-white font-medium mb-1">{theme.name}</h3>
                  <p className="text-[10px] text-gray-500">{theme.desc}</p>
                  {settings.theme === theme.id && (
                    <div className="absolute top-3 right-3 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* Glow Colors */}
          <section className="bg-card/30 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Zap className="w-5 h-5 text-primaryLight" />
              Accent Colors
            </h2>
            <div className="flex flex-wrap gap-4">
              {colors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => updateSettings({ accentColor: color.value })}
                  className={`w-12 h-12 rounded-full transition-all relative ${
                    settings.accentColor === color.value 
                      ? 'scale-110 shadow-[0_0_15px_rgba(255,255,255,0.3)] ring-2 ring-white/50' 
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: color.value }}
                >
                  {settings.accentColor === color.value && (
                    <Check className="w-5 h-5 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  )}
                </button>
              ))}
              <button className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 via-blue-500 to-red-500 p-0.5">
                <div className="w-full h-full rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center">
                  <Palette className="w-5 h-5 text-gray-400" />
                </div>
              </button>
            </div>
          </section>

          {/* Font Size */}
          <section className="bg-card/30 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Type className="w-5 h-5 text-primaryLight" />
              Font Size
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: 'small', name: 'Small', desc: 'More content on screen', size: 'text-sm' },
                { id: 'medium', name: 'Medium', desc: 'Balanced for comfort', size: 'text-base' },
                { id: 'large', name: 'Large', desc: 'Better visibility', size: 'text-lg' }
              ].map((font) => (
                <button
                  key={font.id}
                  onClick={() => updateSettings({ fontSize: font.id })}
                  className={`p-6 rounded-2xl border transition-all text-left group relative ${
                    settings.fontSize === font.id 
                      ? 'bg-primary/10 border-primary shadow-[0_0_20px_rgba(139,92,246,0.1)]' 
                      : 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10'
                  }`}
                >
                  <span className={`block mb-4 font-bold ${font.size} ${settings.fontSize === font.id ? 'text-primary' : 'text-white'}`}>Aa</span>
                  <h3 className="text-white font-medium mb-1">{font.name}</h3>
                  <p className="text-[10px] text-gray-500">{font.desc}</p>
                  {settings.fontSize === font.id && (
                    <div className="absolute top-3 right-3 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Live Preview */}
        <div className="lg:col-span-1">
          <div className="sticky top-8">
            <h2 className="text-lg font-bold text-white mb-4 pl-4 flex items-center gap-2">
              Live Preview
            </h2>
            <div className="bg-[#050505] rounded-[2.5rem] border border-white/10 p-2 shadow-2xl overflow-hidden aspect-[9/16] max-h-[600px] mx-auto w-full max-w-[320px]">
              <div className="h-full bg-background rounded-[2rem] overflow-hidden flex flex-col border border-white/5">
                {/* Mini Header */}
                <div className="p-3 border-b border-white/5 flex items-center justify-between">
                  <div className="w-12 h-2 bg-white/10 rounded-full"></div>
                  <div className="flex gap-2">
                    <div className="w-4 h-4 rounded-full bg-white/5"></div>
                    <div className="w-4 h-4 rounded-full bg-white/5"></div>
                  </div>
                </div>
                
                {/* Mini Layout */}
                <div className="flex flex-1 overflow-hidden">
                  <div className="w-12 border-r border-white/5 p-2 space-y-2">
                    {[1,2,3,4].map(i => <div key={i} className={`w-full aspect-square rounded-lg ${i === 1 ? 'bg-primary' : 'bg-white/5'}`}></div>)}
                  </div>
                  <div className="flex-1 p-4 space-y-4">
                    <div className="w-3/4 h-4 bg-white/10 rounded-lg mb-2"></div>
                    <div className="space-y-2">
                      <div className="w-full h-2 bg-white/5 rounded-full"></div>
                      <div className="w-full h-2 bg-white/5 rounded-full"></div>
                      <div className="w-1/2 h-2 bg-white/5 rounded-full"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <div className="h-20 bg-card border border-white/5 rounded-xl shadow-lg shadow-primary/5"></div>
                      <div className="h-20 bg-card border border-white/5 rounded-xl"></div>
                    </div>
                    <button className="w-full py-2 bg-primary rounded-lg shadow-lg shadow-primary/20"></button>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-center text-[10px] text-gray-500 mt-4 px-8 italic">
              Preview matches your current theme and accent color selections.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AppearanceSettings;
