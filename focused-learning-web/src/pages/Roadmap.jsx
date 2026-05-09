import React, { useState, useEffect } from 'react';
import { BookOpen, Zap, CheckCircle2, Circle, ArrowRight, Loader2, Plus, Trash2 } from 'lucide-react';
import { fetchApi } from '../api';

const Roadmap = ({ user }) => {
  const [goal, setGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [activeRoadmap, setActiveRoadmap] = useState(null);
  const [error, setError] = useState(null);

  const fetchActiveRoadmap = async () => {
    try {
      setFetching(true);
      const data = await fetchApi('/roadmap/active');
      setActiveRoadmap(data);
    } catch (err) {
      // If 404, it just means no active roadmap
      if (err.message.includes('404')) {
        setActiveRoadmap(null);
      } else {
        setError("Failed to load roadmap.");
      }
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchActiveRoadmap();
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!goal.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const data = await fetchApi('/roadmap/generate', {
        method: 'POST',
        body: JSON.stringify({ goal }),
      });
      setActiveRoadmap(data);
      setGoal('');
    } catch (err) {
      setError(err.message || "Failed to generate roadmap.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this roadmap?")) return;
    try {
      await fetchApi(`/roadmap/${id}`, { method: 'DELETE' });
      setActiveRoadmap(null);
    } catch (err) {
      alert("Failed to delete roadmap.");
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 animate-fade-in">
      {!activeRoadmap ? (
        <div className="text-center py-20 bg-surface rounded-[3rem] border border-card shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary rounded-full blur-[120px]"></div>
          </div>
          
          <div className="relative z-10 max-w-2xl mx-auto px-6">
            <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <Zap className="w-10 h-10 text-primaryLight" />
            </div>
            <h1 className="text-4xl font-black text-white mb-6">Create Your Learning Path</h1>
            <p className="text-gray-400 text-lg mb-10 leading-relaxed">
              Tell us what you want to learn, and our AI will generate a structured step-by-step roadmap tailored to your goal.
            </p>

            <form onSubmit={handleGenerate} className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g. Master React and Tailwind CSS"
                className="flex-1 bg-card border border-gray-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-primary transition-all shadow-inner"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-primary hover:bg-primaryDark text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>Generate <ArrowRight className="w-5 h-5" /></>
                )}
              </button>
            </form>
            {error && <p className="mt-4 text-red-400 text-sm">{error}</p>}
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-surface p-8 rounded-3xl border border-card shadow-xl">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-primary/20 text-primaryLight text-[10px] font-black uppercase tracking-widest rounded-full border border-primary/20">
                  Active Roadmap
                </span>
              </div>
              <h1 className="text-3xl font-black text-white mb-2">{activeRoadmap.goal}</h1>
              <p className="text-gray-400 max-w-2xl">{activeRoadmap.description}</p>
            </div>
            <button 
              onClick={() => handleDelete(activeRoadmap._id)}
              className="p-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-2xl border border-red-500/20 transition-all flex-shrink-0"
              title="Delete Roadmap"
            >
              <Trash2 className="w-6 h-6" />
            </button>
          </div>

          {/* Timeline */}
          <div className="relative space-y-4">
            {/* Vertical Line */}
            <div className="absolute left-8 top-10 bottom-10 w-0.5 bg-gradient-to-b from-primary/50 via-gray-800 to-transparent hidden md:block"></div>

            {activeRoadmap.topics.map((topic, index) => (
              <div 
                key={index} 
                className="relative flex flex-col md:flex-row gap-6 md:gap-12 group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Node */}
                <div className="hidden md:flex items-center justify-center z-10">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 ${
                    index === 0 ? 'bg-primary border-primaryLight shadow-lg shadow-primary/40' : 'bg-surface border-card group-hover:border-primary/50'
                  }`}>
                    {index === 0 ? (
                      <Zap className="w-8 h-8 text-white fill-white" />
                    ) : (
                      <span className="text-xl font-black text-gray-500 group-hover:text-primaryLight">{index + 1}</span>
                    )}
                  </div>
                </div>

                {/* Content Card */}
                <div className="flex-1 bg-surface border border-card p-6 md:p-8 rounded-[2rem] hover:border-primary/30 transition-all transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/5">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-white group-hover:text-primaryLight transition-colors">{topic.title}</h3>
                    <span className="text-xs font-bold text-gray-500 bg-card px-3 py-1 rounded-full border border-gray-800">
                      ~{topic.estimatedHours}h
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed mb-6">
                    {topic.description}
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <button className="flex items-center gap-2 text-xs font-bold text-primaryLight hover:text-white transition-colors group/btn">
                      View Resources <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                    <div className="flex items-center gap-2">
                       <Circle className="w-5 h-5 text-gray-700" />
                       <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Pending</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="pt-12 text-center">
            <button 
              onClick={() => setActiveRoadmap(null)}
              className="px-8 py-4 bg-card border border-gray-800 text-gray-400 font-bold rounded-2xl hover:text-white hover:border-primary/50 transition-all"
            >
              Start a New Learning Journey
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Roadmap;
