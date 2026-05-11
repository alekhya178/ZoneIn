import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Chatbot from './components/Chatbot/Chatbot';
import Home from './pages/Home';
import Analytics from './pages/Analytics';
import StudySessions from './pages/StudySessions';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import RoadmapList from './pages/roadmap/RoadmapList';
import RoadmapDetail from './pages/roadmap/RoadmapDetail';
import TopicDetail from './pages/roadmap/TopicDetail';
import Notebook from './pages/Notebook';
import Profile from './pages/Profile';
import Landing from './pages/Landing';
import Settings from './pages/Settings';
import Contact from './pages/Contact';
import { fetchApi } from './api';
import { Lock, Zap, ArrowRight, ExternalLink } from 'lucide-react';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const loadUser = async () => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromExtension = params.get("token");
    
    if (tokenFromExtension) {
      localStorage.setItem("token", tokenFromExtension);
      window.history.replaceState({}, "", window.location.pathname);
    }

    const token = localStorage.getItem("token");
    if (token && token !== "undefined" && token !== "null") {
      try {
        const userData = await fetchApi('/auth/me');
        setUser(userData);
        
        // Apply appearance settings
        try {
          const appearance = await fetchApi('/settings/appearance');
          if (appearance) {
            const root = document.documentElement;
            root.classList.remove('light-mode', 'purple-mode');
            if (appearance.theme === 'light') root.classList.add('light-mode');
            if (appearance.theme === 'purple') root.classList.add('purple-mode');
            if (appearance.accentColor) {
              root.style.setProperty('--primary', appearance.accentColor);
              root.style.setProperty('--primary-light', appearance.accentColor + 'cc');
            }
          }
        } catch (e) {}
      } catch (err) {
        console.error("Auth failed:", err);
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    } else {
      setUser(null);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();

    // Sync auth state across tabs
    const handleStorage = (e) => {
      if (e.key === 'token') {
        if (!e.newValue) {
          setUser(null);
        } else {
          loadUser();
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="flex h-screen bg-background overflow-hidden relative w-full">
        {user && <Sidebar />}
        
        <div className="flex flex-col flex-1 overflow-hidden">
          {user && <TopBar user={user} />}
          
          <main className={`flex-1 overflow-y-auto scroll-smooth ${user ? 'p-6' : ''}`}>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={!user ? <Login setUser={setUser} /> : <Navigate to="/" />} />
              <Route path="/register" element={!user ? <Register setUser={setUser} /> : <Navigate to="/" />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              
              {/* Main Content */}
              <Route path="/" element={user ? <Home user={user} /> : <Landing />} />
              
              {/* Protected Routes */}
              <Route path="/analytics" element={user ? <Analytics user={user} /> : <Navigate to="/login" />} />
              <Route path="/study-sessions" element={user ? <StudySessions user={user} /> : <Navigate to="/login" />} />
              <Route path="/roadmaps" element={user ? <RoadmapList user={user} /> : <Navigate to="/login" />} />
              <Route path="/roadmap/:roadmapId" element={user ? <RoadmapDetail /> : <Navigate to="/login" />} />
              <Route path="/roadmap/:roadmapId/topic/:topicId" element={user ? <TopicDetail /> : <Navigate to="/login" />} />
              <Route path="/notebook" element={user ? <Notebook /> : <Navigate to="/login" />} />
              <Route path="/profile" element={user ? <Profile user={user} setUser={setUser} /> : <Navigate to="/login" />} />
              <Route path="/settings" element={user ? <Settings user={user} setUser={setUser} /> : <Navigate to="/login" />} />
              <Route path="/contact" element={user ? <Contact /> : <Navigate to="/login" />} />
              
              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
        
        {user && <Chatbot />}
      </div>
    </Router>
  );
}


export default App;

