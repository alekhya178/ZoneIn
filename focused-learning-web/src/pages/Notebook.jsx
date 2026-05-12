import React, { useState, useEffect } from 'react';
import { 
  Notebook as NotebookIcon, Search, PlayCircle, 
  Trash2, Loader2, Calendar, FileText, 
  Plus, ExternalLink, Zap, BookOpen, ChevronLeft, ChevronRight
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { fetchApi } from '../api';

const Notebook = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('general'); // Default to general as per user focus
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2;

  // Generation State
  const [videoUrl, setVideoUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [genStatus, setGenStatus] = useState('');

  const loadNotes = async () => {
    try {
      setLoading(true);
      const res = await fetchApi('/notes');
      setNotes(res.notes || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, []);

  // Reset page when switching tabs
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this note?")) return;
    try {
      await fetchApi(`/notes/${id}`, { method: 'DELETE' });
      setNotes(notes.filter(n => n._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!videoUrl) return;

    try {
      setIsGenerating(true);
      setGenStatus('Initializing pipeline...');
      
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/notes/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ videoUrl })
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.replace('data: ', ''));
            
            if (data.status) {
              setGenStatus(data.status);
            }
            
            if (data.success) {
              setNotes(prev => [data.note, ...prev]);
              setVideoUrl('');
              setActiveTab('general');
              setIsGenerating(false);
              setGenStatus('');
            }

            if (data.success === false) {
              throw new Error(data.message);
            }
          }
        }
      }
    } catch (err) {
      alert(err.message);
      setIsGenerating(false);
      setGenStatus('');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', day: 'numeric', year: 'numeric' 
    });
  };

  const personalizedNotes = Array.isArray(notes) ? notes.filter(n => n.type === 'topic_notes' || n.type === 'personalized') : [];
  const generalNotes = Array.isArray(notes) ? notes.filter(n => n.type === 'general' || n.type === 'manual_note' || n.type === 'ai_summary') : [];

  const displayNotes = activeTab === 'personalized' ? personalizedNotes : generalNotes;

  // Pagination Logic
  const totalPages = Math.ceil(displayNotes.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = displayNotes.slice(indexOfFirstItem, indexOfLastItem);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Accessing Archives...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex flex-col animate-fade-in pb-20">
      <header className="mb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-8">
          <div>
            <h1 className="text-4xl font-black text-white mb-2">Notebook</h1>
            <p className="text-gray-400 font-medium">Capture knowledge, generate insights.</p>
          </div>
          
          <div className="flex bg-surface border border-card rounded-2xl p-1 shadow-inner self-start">
            <button 
              onClick={() => setActiveTab('personalized')}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === 'personalized' ? 'bg-primary text-white shadow-lg' : 'text-gray-500 hover:text-white'
              }`}
            >
              Personalized
            </button>
            <button 
              onClick={() => setActiveTab('general')}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === 'general' ? 'bg-primary text-white shadow-lg' : 'text-gray-500 hover:text-white'
              }`}
            >
              General
            </button>
          </div>
        </div>

        {/* AI Generation Tool - ONLY in General Tab */}
        {activeTab === 'general' && (
          <div className="bg-surface border border-card rounded-[2.5rem] p-8 glow-card overflow-hidden relative animate-fade-in">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Zap className="w-32 h-32 text-primary" />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <PlayCircle className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-black text-white">AI Note Generator</h2>
              </div>

              <form onSubmit={handleGenerate} className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input 
                    type="text" 
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="Paste any YouTube URL to generate educational notes..."
                    className="w-full bg-[#0f1117] border border-white/5 rounded-2xl py-5 pl-16 pr-6 text-sm text-gray-200 focus:outline-none focus:border-primary/30 transition-all shadow-inner"
                    disabled={isGenerating}
                  />
                </div>
                <button 
                  type="submit"
                  disabled={isGenerating || !videoUrl}
                  className="px-10 py-5 bg-primary hover:bg-primaryDark text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl transition-all shadow-xl shadow-primary/20 disabled:opacity-30 disabled:shadow-none flex items-center justify-center gap-3"
                >
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {isGenerating ? 'Generating...' : 'Generate Notes'}
                </button>
              </form>

              {isGenerating && (
                <div className="mt-6 flex items-center gap-3 text-primary animate-pulse">
                  <div className="w-2 h-2 bg-primary rounded-full animate-ping" />
                  <span className="text-xs font-black uppercase tracking-widest">{genStatus}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'personalized' && (
          <div className="p-8 bg-surface/50 border border-card rounded-[2.5rem] flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Topic Archives</h2>
              <p className="text-sm text-gray-500">View notes saved directly from your learning roadmaps.</p>
            </div>
          </div>
        )}
      </header>

      <div className="flex-1">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-12">
          {currentItems.length > 0 ? (
            currentItems.map((note) => (
              <div key={note._id} className="bg-surface border border-card rounded-[2.5rem] p-8 flex flex-col glow-card group transition-all duration-500 min-h-[450px]">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      note.type === 'topic_notes' ? 'bg-primary/10 text-primary' : 'bg-green-500/10 text-green-500'
                    }`}>
                      {note.type === 'topic_notes' ? <Zap className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white line-clamp-1">{note.videoTitle || 'Manual Note'}</h3>
                      <div className="flex items-center gap-2 text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">
                        <Calendar className="w-3 h-3" />
                        {formatDate(note.createdAt)}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDelete(note._id)}
                    className="p-3 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto max-h-[300px] pr-4 custom-scrollbar mb-8">
                  <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown>{note.content || ""}</ReactMarkdown>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {note.videoUrl && (
                      <a 
                        href={note.videoUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-all"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-card/50 rounded-lg border border-white/5">
                      <FileText className="w-3 h-3 text-gray-500" />
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        {(note.content || "").split(' ').length} Words
                      </span>
                    </div>
                  </div>
                  <button className="text-[10px] font-black text-primary uppercase tracking-[0.2em] hover:underline">
                    Edit Note
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="xl:col-span-2 flex flex-col items-center justify-center py-20 text-center bg-surface/30 border border-dashed border-card rounded-[3rem]">
              <div className="w-20 h-20 bg-card rounded-full flex items-center justify-center mb-6 text-gray-800">
                <NotebookIcon className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-black text-white mb-2">No {activeTab} notes yet</h3>
              <p className="text-gray-500 text-sm max-w-xs">
                {activeTab === 'personalized' 
                  ? "Start a roadmap and save notes on specific topics to see them here."
                  : "Paste a YouTube URL above to generate AI study notes automatically."}
              </p>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex flex-col items-center justify-center gap-6 mt-12 animate-fade-in">
            <div className="flex items-center gap-4 bg-surface/50 border border-card rounded-2xl p-2 px-6 shadow-xl">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">
                Page <span className="text-primaryLight">{currentPage}</span> / <span className="text-white">{totalPages}</span>
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-8 py-4 bg-card border border-white/5 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-400 hover:text-white hover:border-primary/30 transition-all disabled:opacity-20 active:scale-95 shadow-lg"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 px-10 py-4 bg-primary text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primaryDark transition-all shadow-xl shadow-primary/20 disabled:opacity-20 active:scale-95"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notebook;
