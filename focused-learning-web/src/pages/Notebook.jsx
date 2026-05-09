import React, { useState, useEffect } from 'react';
import { Notebook as NotebookIcon, Search, Trash2, FileText, Video, Calendar, Loader2, Plus } from 'lucide-react';
import { fetchApi } from '../api';

const Notebook = ({ user }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const data = await fetchApi('/notes/all');
      setNotes(data);
    } catch (err) {
      setError("Failed to load notes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this note?")) return;
    try {
      await fetchApi(`/notes/${id}`, { method: 'DELETE' });
      setNotes(notes.filter(n => n._id !== id));
    } catch (err) {
      alert("Failed to delete note.");
    }
  };

  const filteredNotes = notes.filter(note => 
    note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (note.videoTitle && note.videoTitle.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
            <NotebookIcon className="w-8 h-8 text-primaryLight" />
            Learning Notebook
          </h1>
          <p className="text-gray-400">All your study notes and AI video summaries in one place.</p>
        </div>

        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search notes..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface border border-card rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-primary/50 transition-all"
          />
        </div>
      </div>

      {filteredNotes.length === 0 ? (
        <div className="text-center py-20 bg-surface/50 border border-card border-dashed rounded-[3rem]">
          <div className="w-16 h-16 bg-card rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FileText className="w-8 h-8 text-gray-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-400 mb-2">No notes found</h3>
          <p className="text-gray-500 text-sm">Notes you take during your study sessions will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note, index) => (
            <div 
              key={note._id} 
              className="bg-surface border border-card rounded-3xl p-6 hover:border-primary/30 transition-all group flex flex-col h-full shadow-lg hover:shadow-primary/5"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-lg ${note.type === 'ai_summary' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'}`}>
                  {note.type === 'ai_summary' ? <Video className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                </div>
                <button 
                  onClick={() => handleDelete(note._id)}
                  className="p-2 text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {note.videoTitle && (
                <h3 className="text-sm font-bold text-primaryLight mb-2 line-clamp-1">{note.videoTitle}</h3>
              )}

              <div className="flex-1">
                 <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap line-clamp-6">
                  {note.content}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-card flex items-center justify-between text-[10px] font-black text-gray-500 uppercase tracking-widest">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" />
                  {new Date(note.createdAt).toLocaleDateString()}
                </div>
                <span className={note.type === 'ai_summary' ? 'text-purple-500/80' : 'text-blue-500/80'}>
                  {note.type === 'ai_summary' ? 'AI Summary' : 'Manual Note'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notebook;
