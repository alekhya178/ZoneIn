import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Zap, Mail, Lock, ArrowRight, Loader2, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { fetchApi } from '../api';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

const Login = ({ setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Premium entry animation
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => setIsVisible(true), []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Firebase Login
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      if (!firebaseUser.emailVerified) {
        await auth.signOut();
        setError('Please verify your email address before logging in. Check your inbox for the link.');
        setLoading(false);
        return;
      }

      const token = await firebaseUser.getIdToken();

      // 2. Sync with MongoDB
      const data = await fetchApi('/auth/sync', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (data) {
        localStorage.setItem('token', token);
        localStorage.setItem('authUser', JSON.stringify(data));
        setUser(data);
        navigate('/');
      }
    } catch (err) {
      console.error("Login Error:", err);
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

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
              Welcome <span className="text-primaryLight">Back!</span>
            </h1>
            <p className="text-gray-400 text-sm font-medium">Login to continue your learning journey</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Block */}
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
                    placeholder="Enter your email"
                    className="w-full bg-transparent border-none p-0 text-white placeholder:text-gray-600 outline-none text-sm font-medium"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Password Block */}
            <div className="bg-[#0a0a12]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-4 transition-all focus-within:border-primary/50 group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 group-focus-within:bg-primary/20 transition-colors">
                  <Lock className="w-5 h-5 text-primaryLight" />
                </div>
                <div className="flex-1 relative">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Password</label>
                  <div className="flex items-center justify-between">
                    <input 
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full bg-transparent border-none p-0 text-white placeholder:text-gray-600 outline-none text-sm font-medium"
                      required
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end text-xs">
              <Link to="/forgot-password" stroke-width="1.5" className="text-primaryLight hover:text-primary font-bold transition-colors">Forgot Password?</Link>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-xs font-medium text-center">
                {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4.5 bg-primary hover:bg-primaryDark text-white font-bold rounded-2xl transition-all transform active:scale-[0.98] shadow-xl shadow-primary/20 flex items-center justify-center gap-3 group disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  Login <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="mt-10 text-center text-xs text-gray-500">
            New to ZoneIn? <Link to="/register" className="text-primaryLight hover:text-primary font-bold transition-colors ml-1">Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
