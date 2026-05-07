import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Analytics from './pages/Analytics';
import StudySessions from './pages/StudySessions';

function App() {
  const [user, setUser] = useState({ firstName: "John", name: "John Doe" });
  
  const params = new URLSearchParams(window.location.search);
  const tokenFromExtension = params.get("token");
  if (tokenFromExtension) {
    localStorage.setItem("token", tokenFromExtension);
    window.history.replaceState({}, "", window.location.pathname);
  }
  return (
    <Router>
      <div className="flex h-screen bg-background overflow-hidden">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <TopBar user={user} />
          <main className="flex-1 overflow-y-auto p-6 scroll-smooth">
            <Routes>
              <Route path="/analytics" element={<Analytics user={user} />} />
              <Route path="/study-sessions" element={<StudySessions />} />
              <Route path="/" element={<Navigate to="/analytics" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
