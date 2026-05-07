import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { BookOpen, BarChart2, CheckCircle, User, Settings, LogOut, Mail, Info, Clock, Notebook as NotebookIcon, ShieldAlert } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const isAnalytics = location.pathname.startsWith('/analytics');
  const isSessions = location.pathname.startsWith('/study-sessions');

  const navItems = isSessions ? [
    { section: "LEARNING", items: [
      { name: "Dashboard", path: "/", icon: BookOpen },
      { name: "My Roadmap", path: "#", icon: BookOpen },
      { name: "Notes & Summaries", path: "#", icon: NotebookIcon },
      { name: "AI Chatbot", path: "#", icon: Info },
    ]},
    { section: "ANALYTICS", items: [
      { name: "Learning Analytics", path: "/analytics", icon: BarChart2 },
      { name: "Study Sessions", path: "/study-sessions", icon: Clock },
    ]},
    { section: "ACCOUNT", items: [
      { name: "My Profile", path: "#", icon: User },
      { name: "Settings", path: "#", icon: Settings },
      { name: "Achievements", path: "#", icon: CheckCircle },
    ]}
  ] : [
    { section: "LEARNING", items: [
      { name: "Roadmap", path: "#", icon: BookOpen },
      { name: "Summary", path: "#", icon: NotebookIcon },
      { name: "Notebook", path: "#", icon: NotebookIcon },
    ]},
    { section: "ANALYTICS", items: [
      { name: "Learning Analytics", path: "/analytics", icon: BarChart2 },
      { name: "Study Sessions", path: "/study-sessions", icon: Clock },
    ]},
    { section: "ACCOUNT", items: [
      { name: "Profile", path: "#", icon: User },
      { name: "Settings", path: "#", icon: Settings },
      { name: "Sign Out", path: "#", icon: LogOut },
      { name: "Contact", path: "#", icon: Mail },
      { name: "About Us", path: "#", icon: Info },
    ]}
  ];

  return (
    <div className="w-64 bg-surface border-r border-card flex flex-col justify-between">
      <div className="p-6 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold">F</span>
            FocusLearn
          </h1>
          <p className="text-xs text-gray-400 mt-1 pl-10">AI-Powered Learning</p>
        </div>

        {navItems.map((group, idx) => (
          <div key={idx} className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 mb-3 px-3 uppercase tracking-wider">{group.section}</h3>
            <ul className="space-y-1">
              {group.items.map((item, itemIdx) => (
                <li key={itemIdx}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                        isActive && item.path !== '#'
                          ? 'bg-primary text-white font-medium shadow-md shadow-primary/20'
                          : 'text-gray-400 hover:text-white hover:bg-card'
                      }`
                    }
                  >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="p-6">
        <div className="bg-card rounded-xl p-4 border border-gray-800 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-primary/10 rounded-bl-full transform translate-x-8 -translate-y-8 group-hover:bg-primary/20 transition-colors"></div>
          
          {isSessions ? (
            <>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white">Chrome Extension</span>
                <span className="flex items-center text-xs text-green-400">
                  <span className="w-2 h-2 rounded-full bg-green-500 mr-1 animate-pulse"></span>
                  Active
                </span>
              </div>
              <p className="text-xs text-gray-400 mb-4">Distraction blocking is ON</p>
              <button className="w-full py-2 bg-primary/20 hover:bg-primary/30 text-primaryLight text-xs font-medium rounded-lg transition-colors border border-primary/30">
                Open Extension
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white">Extension Active</span>
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              </div>
              <p className="text-xs text-gray-400 mb-4 flex items-center gap-1">
                <ShieldAlert className="w-3 h-3 text-primaryLight" />
                You're in Focus Mode!
              </p>
              <button className="w-full py-2 border border-primary text-primaryLight hover:bg-primary/10 text-xs font-medium rounded-lg transition-colors">
                Toggle Off
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
