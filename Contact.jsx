import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, Send, Globe, ChevronDown, HelpCircle, Headset, ExternalLink, User, AtSign, FileText } from 'lucide-react';
import { fetchApi } from '../api';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', content: '' });
  const [openFaq, setOpenFaq] = useState(null);

  const contactInfo = [
    { icon: Mail, title: 'Email Support', value: 'support@focuslearn.ai', sub: 'We reply to all emails', color: 'text-blue-400' },
    { icon: Phone, title: 'Phone Support', value: '+91 98765 43210', sub: 'Mon - Sat, 10AM - 6PM', color: 'text-green-400' },
    { icon: MapPin, title: 'Our Location', value: 'Andhra Pradesh, India', sub: 'Visakhapatnam, 530001', color: 'text-red-400' },
    { icon: Clock, title: 'Response Time', value: '24 Hours', sub: 'Average response time', color: 'text-yellow-400' }
  ];

  const faqs = [
    { q: 'How does Focus Mode work?', a: 'Focus Mode blocks distracting YouTube elements like Shorts, recommendations, and trending content to help you stay on task.' },
    { q: 'Is the extension free to use?', a: 'Yes, FocusLearn offers a comprehensive free tier with all essential features for individual learners.' },
    { q: 'Can I track my study time?', a: 'Absolutely! Our dashboard provides detailed analytics and study session tracking to help you monitor your progress.' },
    { q: 'How do AI summaries work?', a: 'Our AI analyzes educational content and generates concise, actionable summaries and notes for your notebook.' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetchApi('/contact', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      setStatus({ type: 'success', content: 'Message sent successfully! We will get back to you soon.' });
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setStatus({ type: 'error', content: err.message || 'Failed to send message' });
    } finally {
      setLoading(false);
      setTimeout(() => setStatus({ type: '', content: '' }), 5000);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto space-y-12 pb-20"
    >
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-black text-white tracking-tight">Contact Us</h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">We'd love to hear from you. Reach out for support, feedback, or collaboration.</p>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {contactInfo.map((info, idx) => (
          <motion.div 
            key={idx}
            whileHover={{ y: -5 }}
            className="bg-card/30 backdrop-blur-xl border border-white/5 p-8 rounded-[2rem] shadow-xl relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-bl-full group-hover:bg-primary/10 transition-colors"></div>
            <info.icon className={`w-10 h-10 mb-6 ${info.color}`} />
            <h3 className="text-white font-bold text-lg mb-2">{info.title}</h3>
            <p className="text-primaryLight font-medium mb-1">{info.value}</p>
            <p className="text-gray-500 text-xs">{info.sub}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Form */}
        <div className="lg:col-span-2">
          <section className="bg-card/30 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden h-full">
            <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
              <Send className="w-8 h-8 text-primary" />
              Send Us a Message
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-primary transition-colors" />
                    <input 
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                      className="w-full bg-surface border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
                  <div className="relative group">
                    <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-primary transition-colors" />
                    <input 
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                      className="w-full bg-surface border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Subject</label>
                <div className="relative group">
                  <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-primary transition-colors" />
                  <input 
                    type="text"
                    placeholder="Enter subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    required
                    className="w-full bg-surface border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Message</label>
                <div className="relative group">
                  <FileText className="absolute left-4 top-4 w-4 h-4 text-gray-500 group-focus-within:text-primary transition-colors" />
                  <textarea 
                    placeholder="Type your message here..."
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    required
                    className="w-full bg-surface border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all min-h-[150px]"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-primary to-primaryLight text-white font-bold rounded-2xl flex items-center justify-center gap-3 transition-all hover:shadow-2xl hover:shadow-primary/40 hover:-translate-y-1 active:scale-95 disabled:opacity-50"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <Send className="w-5 h-5" />}
                Send Message
              </button>

              <AnimatePresence>
                {status.content && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`p-4 rounded-xl text-sm font-medium text-center ${
                      status.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}
                  >
                    {status.content}
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </section>
        </div>

        {/* Sidebar Sections */}
        <div className="space-y-8 flex flex-col">
          {/* Connect Card */}
          <section className="bg-card/30 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 shadow-xl flex-1">
            <h2 className="text-xl font-bold text-white mb-2">Connect With Us</h2>
            <p className="text-gray-500 text-xs mb-8">Follow us on our social platforms</p>
            
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Globe, label: 'GitHub', color: 'hover:text-white hover:border-white' },
                { icon: Globe, label: 'LinkedIn', color: 'hover:text-blue-500 hover:border-blue-500' },
                { icon: Globe, label: 'Twitter', color: 'hover:text-sky-400 hover:border-sky-400' },
                { icon: Globe, label: 'Instagram', color: 'hover:text-pink-500 hover:border-pink-500' }
              ].map((social, idx) => (
                <button 
                  key={idx}
                  className={`flex flex-col items-center gap-3 p-6 bg-white/5 border border-white/5 rounded-2xl transition-all ${social.color} group`}
                >
                  <social.icon className="w-6 h-6 transition-transform group-hover:scale-110" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{social.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Help Center Card */}
          <section className="bg-gradient-to-br from-primary/20 to-primaryLight/5 border border-primary/20 rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center mb-6">
                <Headset className="w-6 h-6 text-primaryLight" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Need more help?</h2>
              <p className="text-gray-400 text-sm mb-8 leading-relaxed">Check out our Help Center for detailed guides and support documentation.</p>
              <button className="flex items-center gap-2 px-6 py-3 border border-primary/30 text-primaryLight rounded-xl font-bold text-sm hover:bg-primary/10 transition-all">
                Visit Help Center <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* FAQ Section */}
      <section className="bg-card/30 backdrop-blur-xl border border-white/5 rounded-[3rem] p-8 md:p-16 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col items-center text-center mb-16">
          <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center mb-6">
            <HelpCircle className="w-8 h-8 text-primaryLight" />
          </div>
          <h2 className="text-4xl font-black text-white mb-4">Frequently Asked Questions</h2>
          <p className="text-gray-500 max-w-xl">Find quick answers to common questions about FocusLearn and how to optimize your learning experience.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {faqs.map((faq, idx) => (
            <div 
              key={idx}
              className="bg-white/5 border border-white/5 rounded-3xl p-8 hover:border-primary/20 transition-all group"
            >
              <h3 className="text-white font-bold text-lg mb-4 flex items-start gap-3">
                <span className="w-6 h-6 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0 text-primaryLight text-xs">Q</span>
                {faq.q}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed pl-9">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer Placeholder */}
      <footer className="border-t border-white/5 pt-12 flex flex-col md:flex-row justify-between items-center gap-8 text-gray-500 text-sm">
        <p>© 2024 FocusLearn. All rights reserved.</p>
        <div className="flex gap-8">
          <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-primary transition-colors">Help Center</a>
        </div>
      </footer>
    </motion.div>
  );
};

export default Contact;
