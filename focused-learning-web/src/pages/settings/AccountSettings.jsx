import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, AtSign, Target, FileText, Camera, Edit2, Check, X, Lock, Eye, EyeOff } from 'lucide-react';
import { fetchApi } from '../../api';

const AccountSettings = ({ user, setUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    username: user?.username || user?.email?.split('@')[0] || '',
    currentGoal: user?.currentGoal || 'Web Development',
    bio: user?.bio || 'Passionate about learning and building cool projects.'
  });
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', content: '' });

  const goals = [
    "Data Structures & Algorithms (DSA)",
    "Python Development",
    "Web Development",
    "Machine Learning",
    "AI Engineering",
    "Java Programming",
    "Cyber Security",
    "UI/UX Design"
  ];

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updatedUser = await fetchApi('/settings/profile', {
        method: 'PUT',
        body: JSON.stringify(formData)
      });
      setUser(updatedUser);
      setIsEditing(false);
      setMsg({ type: 'success', content: 'Profile updated successfully!' });
    } catch (err) {
      setMsg({ type: 'error', content: err.message || 'Failed to update profile' });
    } finally {
      setLoading(false);
      setTimeout(() => setMsg({ type: '', content: '' }), 3000);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      setMsg({ type: 'error', content: 'Passwords do not match' });
      return;
    }
    setLoading(true);
    setMsg({ type: '', content: '' });
    console.log("Attempting password update...");

    try {
      const res = await fetchApi('/settings/password', {
        method: 'PUT',
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword
        })
      });
      
      console.log("Password update response:", res);
      setMsg({ type: 'success', content: 'Password updated successfully!' });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      console.error("Password update failed:", err);
      setMsg({ type: 'error', content: err.message || 'Failed to update password' });
    } finally {
      setLoading(false);
      // Auto-hide message after 5 seconds
      setTimeout(() => setMsg({ type: '', content: '' }), 5000);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8 pb-12"
    >
      {/* Floating Notification Card */}
      <AnimatePresence>
        {msg.content && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-10 right-10 z-50 shadow-2xl"
          >
            <div className={`px-8 py-5 rounded-[2rem] border backdrop-blur-2xl flex items-center gap-4 ${
              msg.type === 'success' 
                ? 'bg-green-500/20 border-green-500/30 text-green-100' 
                : 'bg-red-500/20 border-red-500/30 text-red-100'
            }`}>
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                msg.type === 'success' ? 'bg-green-500/20' : 'bg-red-500/20'
              }`}>
                {msg.type === 'success' ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
              </div>
              <div>
                <p className="font-bold text-sm tracking-wide">
                  {msg.type === 'success' ? 'Security Updated' : 'Update Failed'}
                </p>
                <p className="text-xs opacity-80">{msg.content}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Account Settings</h1>
          <p className="text-gray-400">Manage your personal information and account settings.</p>
        </div>
      </div>

      {/* Profile Information Card */}
      <section className="bg-card/30 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-bl-full -translate-y-32 translate-x-32 blur-3xl group-hover:bg-primary/10 transition-colors"></div>
        
        <div className="flex justify-between items-start mb-10">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <User className="w-6 h-6 text-primaryLight" />
            Profile Information
          </h2>
          {!isEditing ? (
            <button 
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-5 py-2.5 border border-primary/30 text-primaryLight rounded-xl hover:bg-primary/10 transition-all font-semibold text-sm"
            >
              <Edit2 className="w-4 h-4" /> Edit Profile
            </button>
          ) : (
            <div className="flex gap-3">
              <button 
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-2 px-5 py-2.5 border border-white/10 text-gray-400 rounded-xl hover:bg-white/5 transition-all font-semibold text-sm"
              >
                <X className="w-4 h-4" /> Cancel
              </button>
              <button 
                onClick={handleProfileUpdate}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primaryDark transition-all font-semibold text-sm shadow-xl shadow-primary/20 disabled:opacity-50"
              >
                {loading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <Check className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-12">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative group/avatar">
              <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-primary to-primaryLight p-1 shadow-2xl shadow-primary/30">
                <div className="w-full h-full rounded-full bg-surface flex items-center justify-center text-4xl font-black text-white">
                  {formData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
              </div>
              <button className="absolute bottom-1 right-1 w-10 h-10 bg-primary hover:bg-primaryDark text-white rounded-full flex items-center justify-center border-4 border-surface shadow-lg transition-transform hover:scale-110">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div className="text-center">
              <p className="text-white font-bold text-lg">{formData.name}</p>
              <p className="text-gray-500 text-xs uppercase tracking-widest font-bold mt-1">Student</p>
            </div>
          </div>

          {/* Form Section */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-primary transition-colors" />
                {isEditing ? (
                  <input 
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-surface border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                  />
                ) : (
                  <div className="w-full bg-white/5 border border-transparent rounded-2xl py-3.5 pl-12 pr-4 text-gray-300">
                    {formData.name}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-primary transition-colors" />
                {isEditing ? (
                  <input 
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-surface border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                  />
                ) : (
                  <div className="w-full bg-white/5 border border-transparent rounded-2xl py-3.5 pl-12 pr-4 text-gray-300">
                    {formData.email}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Username</label>
              <div className="relative group">
                <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-primary transition-colors" />
                {isEditing ? (
                  <input 
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    className="w-full bg-surface border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                  />
                ) : (
                  <div className="w-full bg-white/5 border border-transparent rounded-2xl py-3.5 pl-12 pr-4 text-gray-300">
                    {formData.username}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Current Goal</label>
              <div className="relative group">
                <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-primary transition-colors" />
                {isEditing ? (
                  <select 
                    value={formData.currentGoal}
                    onChange={(e) => setFormData({...formData, currentGoal: e.target.value})}
                    className="w-full bg-surface border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all appearance-none"
                  >
                    {goals.map(goal => <option key={goal} value={goal}>{goal}</option>)}
                  </select>
                ) : (
                  <div className="w-full bg-white/5 border border-transparent rounded-2xl py-3.5 pl-12 pr-4 text-gray-300">
                    {formData.currentGoal}
                  </div>
                )}
              </div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Change Bio</label>
              <div className="relative group">
                <FileText className="absolute left-4 top-4 w-4 h-4 text-gray-500 group-focus-within:text-primary transition-colors" />
                {isEditing ? (
                  <textarea 
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    maxLength={250}
                    className="w-full bg-surface border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all min-h-[100px] resize-none"
                  />
                ) : (
                  <div className="w-full bg-white/5 border border-transparent rounded-2xl py-3.5 pl-12 pr-4 text-gray-300 min-h-[100px]">
                    {formData.bio}
                  </div>
                )}
              </div>
              {isEditing && <p className="text-right text-[10px] text-gray-600">{formData.bio.length}/250</p>}
            </div>
          </div>
        </div>
      </section>

      {/* Change Password Card */}
      <section className="bg-card/30 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden group">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-10">
          <Lock className="w-6 h-6 text-primaryLight" />
          Security & Password
        </h2>

        <form onSubmit={handlePasswordUpdate} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { id: 'current', label: 'Current Password', key: 'currentPassword' },
            { id: 'new', label: 'New Password', key: 'newPassword' },
            { id: 'confirm', label: 'Confirm New Password', key: 'confirmPassword' }
          ].map((field) => (
            <div key={field.id} className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">{field.label}</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-primary transition-colors" />
                <input 
                  type={showPasswords[field.id] ? "text" : "password"}
                  value={passwords[field.key]}
                  onChange={(e) => setPasswords({...passwords, [field.key]: e.target.value})}
                  required
                  className="w-full bg-surface border border-white/5 rounded-2xl py-3.5 pl-12 pr-12 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                />
                <button 
                  type="button"
                  onClick={() => setShowPasswords({...showPasswords, [field.id]: !showPasswords[field.id]})}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  {showPasswords[field.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}

          <div className="md:col-span-3 flex justify-end mt-4">
            <button 
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-xl hover:bg-primaryDark transition-all font-semibold text-sm shadow-xl shadow-primary/20 disabled:opacity-50"
            >
              {loading && <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>}
              Update Password
            </button>
          </div>
        </form>
      </section>
    </motion.div>
  );
};

export default AccountSettings;
