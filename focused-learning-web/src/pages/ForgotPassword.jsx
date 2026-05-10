import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Loader2, KeyRound, CheckCircle2, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { fetchApi } from '../api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await fetchApi('/auth/send-password-otp', {
        method: 'POST',
        body: { email }
      });
      setStep(2);
    } catch (err) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await fetchApi('/auth/verify-password-otp', {
        method: 'POST',
        body: { email, otp }
      });
      setStep(3);
    } catch (err) {
      setError(err.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await fetchApi('/auth/reset-password-with-otp', {
        method: 'POST',
        body: { email, otp, newPassword }
      });
      alert('Password reset successful! Please login with your new password.');
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020205] flex items-center justify-center p-6 relative overflow-hidden py-12">
      {/* Premium Dynamic Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(10,10,20,0)_0%,rgba(2,2,5,1)_100%)]"></div>
        <div className="absolute top-[-10%] right-[-5%] w-[70%] h-[70%] bg-primary/10 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[70%] h-[70%] bg-purple-600/5 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '3s' }}></div>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
      </div>

      <div className="w-full max-w-2xl relative z-10 animate-fade-in">
        <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/5 rounded-[3rem] p-8 md:p-16 shadow-2xl shadow-black/50">
          
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center mb-10">
                <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
                  Reset <span className="text-primaryLight">Password</span>
                </h1>
                <p className="text-gray-400 text-sm font-medium">Enter your email to receive a verification code</p>
              </div>

              <form onSubmit={handleSendOTP} className="space-y-6">
                <div className="bg-[#0a0a12]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-4 transition-all focus-within:border-primary/50 group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 group-focus-within:bg-primary/20 transition-colors">
                      <Mail className="w-5 h-5 text-primaryLight" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Email Address</label>
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full bg-transparent border-none p-0 text-white placeholder:text-gray-600 outline-none text-sm font-medium"
                        required
                      />
                    </div>
                  </div>
                </div>

                {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-xs font-medium text-center">{error}</div>}

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-4.5 bg-primary hover:bg-primaryDark text-white font-bold rounded-2xl transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 group"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Send Code <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>}
                </button>
              </form>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center mb-10">
                <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
                  Verify <span className="text-primaryLight">Code</span>
                </h1>
                <p className="text-gray-400 text-sm font-medium">We sent a 6-digit code to {email}</p>
              </div>

              <form onSubmit={handleVerifyOTP} className="space-y-6">
                <div className="bg-[#0a0a12]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-4 transition-all focus-within:border-primary/50 group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 group-focus-within:bg-primary/20 transition-colors">
                      <KeyRound className="w-5 h-5 text-primaryLight" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Verification Code</label>
                      <input 
                        type="text" 
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="123456"
                        className="w-full bg-transparent border-none p-0 text-white placeholder:text-gray-600 outline-none text-sm font-medium tracking-[0.5em]"
                        maxLength={6}
                        required
                      />
                    </div>
                  </div>
                </div>

                {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-xs font-medium text-center">{error}</div>}

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-4.5 bg-primary hover:bg-primaryDark text-white font-bold rounded-2xl transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 group"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Verify Code <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>}
                </button>
                <button type="button" onClick={() => setStep(1)} className="w-full text-gray-500 text-xs font-bold hover:text-white transition-colors">Change Email</button>
              </form>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center mb-10">
                <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
                  New <span className="text-primaryLight">Password</span>
                </h1>
                <p className="text-gray-400 text-sm font-medium">Create a strong password for your account</p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-6">
                <div className="bg-[#0a0a12]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-4 transition-all focus-within:border-primary/50 group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 group-focus-within:bg-primary/20 transition-colors">
                      <Lock className="w-5 h-5 text-primaryLight" />
                    </div>
                    <div className="flex-1 relative">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">New Password</label>
                      <div className="flex items-center justify-between">
                        <input 
                          type={showPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-transparent border-none p-0 text-white placeholder:text-gray-600 outline-none text-sm font-medium"
                          required
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-500 hover:text-gray-300">
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#0a0a12]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-4 transition-all focus-within:border-primary/50 group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 group-focus-within:bg-primary/20 transition-colors">
                      <Lock className="w-5 h-5 text-primaryLight" />
                    </div>
                    <div className="flex-1 relative">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Confirm New Password</label>
                      <div className="flex items-center justify-between">
                        <input 
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-transparent border-none p-0 text-white placeholder:text-gray-600 outline-none text-sm font-medium"
                          required
                        />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="text-gray-500 hover:text-gray-300">
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-xs font-medium text-center">{error}</div>}

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-4.5 bg-primary hover:bg-primaryDark text-white font-bold rounded-2xl transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 group"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Reset Password <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>}
                </button>
              </form>
            </div>
          )}

          <p className="mt-10 text-center text-xs text-gray-500">
            Back to <Link to="/login" className="text-primaryLight hover:text-primary font-bold transition-colors ml-1">Log In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
