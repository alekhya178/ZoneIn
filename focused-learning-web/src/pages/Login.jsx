import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Zap, Mail, Lock, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import { fetchApi } from '../api';

const Login = ({ setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Premium entry animation
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => setIsVisible(true), []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await fetchApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      
      if (data.token) {
        localStorage.setItem('token', data.token);
        const userData = await fetchApi('/auth/me');
        setUser(userData);
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center p-6 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primaryLight/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(79,172,254,0.05)_0%,transparent_70%)]"></div>
      </div>

      <div className={`w-full max-w-[440px] z-10 transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
        <div className="bg-surface/40 backdrop-blur-2xl border border-white/5 rounded-[3rem] p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] relative overflow-hidden group">
          {/* Subtle top light effect */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
          
          <div className="text-center mb-12">
            <div className="relative inline-block mb-6">
              <div className="w-20 h-20 bg-primary rounded-[2rem] flex items-center justify-center shadow-[0_0_40px_rgba(79,172,254,0.4)] animate-float">
                <Zap className="w-10 h-10 text-white fill-white" />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-background border-4 border-surface rounded-full p-1.5 shadow-lg">
                <ShieldCheck className="w-5 h-5 text-primaryLight" />
              </div>
            </div>
            <h1 className="text-4xl font-black text-white mb-3 tracking-tight">ZoneIn</h1>
            <p className="text-gray-400 font-medium">Step back into the flow state</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group/input">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within/input:text-primary transition-colors" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-card/50 border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-white placeholder:text-gray-600 focus:border-primary/50 focus:bg-card outline-none transition-all duration-300"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Password</label>
                <a href="#" className="text-[10px] font-bold text-primary hover:text-primaryLight transition-colors">Forgot?</a>
              </div>
              <div className="relative group/input">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within/input:text-primary transition-colors" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-card/50 border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-white placeholder:text-gray-600 focus:border-primary/50 focus:bg-card outline-none transition-all duration-300"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-red-400 text-sm text-center animate-shake">
                {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-primary hover:bg-primaryDark text-white font-black rounded-2xl transition-all shadow-[0_20px_40px_-12px_rgba(79,172,254,0.4)] flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                <>
                  <span className="text-lg">Access Dashboard</span>
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-white/5 text-center">
            <p className="text-gray-500 font-medium">
              New to ZoneIn? <Link to="/register" className="text-primary hover:text-primaryLight font-black transition-colors underline-offset-4 hover:underline">Create Account</Link>
            </p>
          </div>
        </div>
        
        {/* Footer info */}
        <p className="mt-8 text-center text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em] opacity-50">
          Powered by AI • Focused Learning • v2.1
        </p>
      </div>
    </div>
  );
};

export default Login;
