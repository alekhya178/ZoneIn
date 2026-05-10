import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Zap, Mail, Lock, User, ArrowRight, Loader2, Eye, EyeOff, CheckCircle2, XCircle, Phone, Globe, MapPin, FileText } from 'lucide-react';
import { fetchApi } from '../api';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from 'firebase/auth';

const Register = ({ setUser }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    preferredName: '',
    email: '',
    contact: '',
    state: '',
    country: '',
    bio: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const passwordRequirements = [
    { label: 'At least 8 characters', test: (p) => p.length >= 8 },
    { label: 'Contains a number', test: (p) => /\d/.test(p) },
    { label: 'Contains special character', test: (p) => /[!@#$%^&*]/.test(p) },
    { label: 'Passwords match', test: (p) => p === formData.confirmPassword && p !== '' }
  ];

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    // Final validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      // 1. Firebase Register
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      await updateProfile(userCredential.user, { 
        displayName: formData.preferredName || `${formData.firstName} ${formData.lastName}` 
      });
      
      // 2. Send Verification Email
      await sendEmailVerification(userCredential.user);
      
      // Force refresh token and add a small delay to avoid clock skew/propagation issues
      await new Promise(resolve => setTimeout(resolve, 1000));
      const token = await userCredential.user.getIdToken(true);

      // 3. Sync with MongoDB
      await fetchApi('/auth/sync', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      
      setIsVerifying(true);
    } catch (err) {
      console.error("Register Error:", err);
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const checkVerification = async () => {
    setLoading(true);
    try {
      await auth.currentUser.reload();
      if (auth.currentUser.emailVerified) {
        const token = await auth.currentUser.getIdToken();
        const userData = await fetchApi('/auth/sync', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        localStorage.setItem('token', token);
        localStorage.setItem('authUser', JSON.stringify(userData));
        setUser(userData);
        navigate('/');
      } else {
        setError('Email not verified yet. Please check your inbox.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden text-white">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
        <div className="w-full max-w-md relative z-10 text-center">
          <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[3rem] p-12 shadow-2xl">
            <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-bounce">
              <Mail className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl font-black mb-4">Verify Email</h1>
            <p className="text-gray-400 mb-8 leading-relaxed">
              We've sent a link to <span className="text-white font-bold">{formData.email}</span>. 
              Click it to activate your account.
            </p>
            
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-red-400 text-sm font-medium mb-6 animate-shake">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <button 
                onClick={checkVerification}
                disabled={loading}
                className="w-full py-5 bg-primary hover:bg-primaryDark text-white font-black rounded-2xl transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 group"
              >
                {loading ? <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div> : "I've Verified"}
              </button>
              <button 
                onClick={async () => {
                  setError('');
                  await sendEmailVerification(auth.currentUser);
                  alert('Sent!');
                }}
                className="text-gray-500 hover:text-white font-bold transition-colors text-sm"
              >
                Resend link
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020205] flex items-center justify-center p-6 relative overflow-hidden py-12">
      {/* Premium Dynamic Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Deep Radial Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(10,10,20,0)_0%,rgba(2,2,5,1)_100%)]"></div>
        
        {/* Pulsing Ambient Glows */}
        <div className="absolute top-[-10%] right-[-5%] w-[70%] h-[70%] bg-primary/10 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[70%] h-[70%] bg-purple-600/5 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '3s' }}></div>
        
        {/* Subtle Mesh/Grid detail (very faint) */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
      </div>

      <div className="w-full max-w-2xl relative z-10 animate-fade-in">
        <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/5 rounded-[3rem] p-8 md:p-16 shadow-2xl shadow-black/50">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
              Create <span className="text-primaryLight">Account</span>
            </h1>
            <p className="text-gray-400 text-sm font-medium">Join the next generation of focused learners</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name Blocks */}
              <div className="bg-[#0a0a12]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-4 transition-all focus-within:border-primary/50 group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 group-focus-within:bg-primary/20 transition-colors">
                    <User className="w-4 h-4 text-primaryLight" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">First Name</label>
                    <input 
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="John"
                      className="w-full bg-transparent border-none p-0 text-white placeholder:text-gray-600 outline-none text-sm font-medium"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="bg-[#0a0a12]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-4 transition-all focus-within:border-primary/50 group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 group-focus-within:bg-primary/20 transition-colors">
                    <User className="w-4 h-4 text-primaryLight" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Last Name</label>
                    <input 
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Doe"
                      className="w-full bg-transparent border-none p-0 text-white placeholder:text-gray-600 outline-none text-sm font-medium"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#0a0a12]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-4 transition-all focus-within:border-primary/50 group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 group-focus-within:bg-primary/20 transition-colors">
                  <Mail className="w-4 h-4 text-primaryLight" />
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Email Address</label>
                  <input 
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="john@example.com"
                    className="w-full bg-transparent border-none p-0 text-white placeholder:text-gray-600 outline-none text-sm font-medium"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#0a0a12]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-4 transition-all focus-within:border-primary/50 group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 group-focus-within:bg-primary/20 transition-colors">
                    <Phone className="w-4 h-4 text-primaryLight" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Contact</label>
                    <input 
                      name="contact"
                      value={formData.contact}
                      onChange={handleInputChange}
                      placeholder="+1 234..."
                      className="w-full bg-transparent border-none p-0 text-white placeholder:text-gray-600 outline-none text-sm font-medium"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="bg-[#0a0a12]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-4 transition-all focus-within:border-primary/50 group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 group-focus-within:bg-primary/20 transition-colors">
                    <User className="w-4 h-4 text-primaryLight" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Nick Name</label>
                    <input 
                      name="preferredName"
                      value={formData.preferredName}
                      onChange={handleInputChange}
                      placeholder="Johnny"
                      className="w-full bg-transparent border-none p-0 text-white placeholder:text-gray-600 outline-none text-sm font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#0a0a12]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-4 transition-all focus-within:border-primary/50 group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 group-focus-within:bg-primary/20 transition-colors">
                    <MapPin className="w-4 h-4 text-primaryLight" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">State</label>
                    <input 
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="California"
                      className="w-full bg-transparent border-none p-0 text-white placeholder:text-gray-600 outline-none text-sm font-medium"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="bg-[#0a0a12]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-4 transition-all focus-within:border-primary/50 group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 group-focus-within:bg-primary/20 transition-colors">
                    <Globe className="w-4 h-4 text-primaryLight" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Country</label>
                    <input 
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      placeholder="USA"
                      className="w-full bg-transparent border-none p-0 text-white placeholder:text-gray-600 outline-none text-sm font-medium"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#0a0a12]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-4 transition-all focus-within:border-primary/50 group">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 group-focus-within:bg-primary/20 transition-colors mt-1">
                  <FileText className="w-4 h-4 text-primaryLight" />
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">About You (Bio)</label>
                  <textarea 
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Tell us a bit about your learning journey..."
                    className="w-full bg-transparent border-none p-0 text-white placeholder:text-gray-600 outline-none text-sm font-medium min-h-[80px] resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#0a0a12]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-4 transition-all focus-within:border-primary/50 group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 group-focus-within:bg-primary/20 transition-colors">
                    <Lock className="w-4 h-4 text-primaryLight" />
                  </div>
                  <div className="flex-1 relative">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Create Password</label>
                    <div className="flex items-center justify-between">
                      <input 
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="••••••••"
                        className="w-full bg-transparent border-none p-0 text-white placeholder:text-gray-600 outline-none text-sm font-medium"
                        required
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-500">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#0a0a12]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-4 transition-all focus-within:border-primary/50 group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 group-focus-within:bg-primary/20 transition-colors">
                    <Lock className="w-4 h-4 text-primaryLight" />
                  </div>
                  <div className="flex-1 relative">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Confirm Password</label>
                    <div className="flex items-center justify-between">
                      <input 
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="••••••••"
                        className="w-full bg-transparent border-none p-0 text-white placeholder:text-gray-600 outline-none text-sm font-medium"
                        required
                      />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="text-gray-500">
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Validation */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 px-1 py-1">
              {passwordRequirements.map((req, idx) => {
                const isMet = req.test(formData.password);
                return (
                  <div key={idx} className={`flex items-center gap-2 transition-all duration-300 ${isMet ? 'opacity-100' : 'opacity-40'}`}>
                    {isMet ? <CheckCircle2 className="w-3 h-3 text-green-500" /> : <XCircle className="w-3 h-3 text-gray-600" />}
                    <span className={`text-[10px] font-bold ${isMet ? 'text-green-500' : 'text-gray-500'}`}>{req.label}</span>
                  </div>
                );
              })}
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-xs font-medium text-center">
                {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4.5 bg-primary hover:bg-primaryDark text-white font-bold rounded-2xl transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 group mt-4"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  Create Account <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-gray-500 text-xs font-medium">
              Already have an account? <Link to="/login" className="text-primaryLight hover:text-primary font-bold transition-colors ml-1">Log In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
