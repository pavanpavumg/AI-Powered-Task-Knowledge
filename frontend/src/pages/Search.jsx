import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import { 
  Search as SearchIcon, LogOut, CheckSquare, Sparkles, 
  HelpCircle, ChevronRight, FileText, ArrowLeft 
} from 'lucide-react';

const Search = () => {
  const { logout, role, user } = useAuth();
  const navigate = useNavigate();
  
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    setError('');
    setSearched(true);
    
    try {
      const response = await api.get(`/search?q=${encodeURIComponent(query)}&top_k=5`);
      setResults(response.data);
    } catch (err) {
      setError('An error occurred while performing semantic search. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToDashboard = () => {
    if (role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  // Helper to highlight terms or format the snippet nicely
  const renderSnippet = (text) => {
    return text;
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', color: 'var(--text-primary)' }}>
      {/* Sidebar */}
      <aside style={{
        width: '260px',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px',
        background: 'var(--bg-glass)',
        backdropFilter: 'blur(20px)'
      }}>
        <div style={{ marginBottom: '32px' }}>
          <h2 className="gradient-text" style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-title)' }}>
            TaskSphere
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', tracking: '0.05em' }}>
            Semantic Search
          </span>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          {role === 'admin' ? (
            <button 
              className="btn btn-ghost"
              style={{ justifyContent: 'flex-start', gap: '12px' }}
              onClick={() => navigate('/admin')}
            >
              <ArrowLeft size={18} />
              Admin Panel
            </button>
          ) : (
            <button 
              className="btn btn-ghost"
              style={{ justifyContent: 'flex-start', gap: '12px' }}
              onClick={() => navigate('/dashboard')}
            >
              <CheckSquare size={18} />
              My Tasks
            </button>
          )}
          
          <button 
            className="btn btn-primary"
            style={{ justifyContent: 'flex-start', gap: '12px' }}
            onClick={() => navigate('/search')}
          >
            <SearchIcon size={18} />
            AI Search
          </button>
        </nav>

        <div style={{ 
          borderTop: '1px solid var(--border-color)', 
          paddingTop: '20px',
          marginTop: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Logged in as:<br/>
            <strong style={{ color: 'var(--text-primary)' }}>{user?.email}</strong>
          </div>
          <button 
            className="btn btn-outline" 
            style={{ width: '100%', gap: '8px', justifyContent: 'center', borderColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }} 
            onClick={logout}
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Search area */}
      <main style={{ flex: 1, padding: '40px', overflowY: 'auto', maxHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>AI Semantic Search</h1>
              <span className="badge badge-primary" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem' }}>
                <Sparkles size={10} /> FAISS Engine
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Locate topics and content across all uploaded document vaults using offline natural language matching.
            </p>
          </div>

          {/* Search bar form */}
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '12px' }}>
            <div className="input-group" style={{ flex: 1 }}>
              <span className="input-icon">
                <SearchIcon size={18} style={{ color: 'var(--text-secondary)' }} />
              </span>
              <input 
                type="text" 
                required
                placeholder="Ask anything (e.g. how do I configure database engines?)"
                className="form-control"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ fontSize: '1rem', padding: '14px 14px 14px 44px' }}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '0 24px' }}>
              Search
            </button>
          </form>

          {error && <div className="alert alert-error">{error}</div>}

          {/* Results panel */}
          <div style={{ marginTop: '16px' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
                <div className="spinner" style={{ margin: '0 auto 16px auto' }} />
                <span>Computing sentence embeddings and scanning FAISS index...</span>
              </div>
            ) : !searched ? (
              <div className="glass" style={{ textAlign: 'center', padding: '50px', background: 'rgba(255,255,255,0.01)' }}>
                <HelpCircle size={40} style={{ color: 'var(--text-secondary)', opacity: 0.3, marginBottom: '16px' }} />
                <h3>No Query Entered</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                  Try searching for a topic from an uploaded document.
                </p>
              </div>
            ) : results.length === 0 ? (
              <div className="glass" style={{ textAlign: 'center', padding: '50px' }}>
                <Sparkles size={40} style={{ color: 'var(--text-secondary)', opacity: 0.3, marginBottom: '16px' }} />
                <h3>No Matches Found</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                  We couldn't find any relevant snippets in the document vector index.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Top vector matches ({results.length})
                </h3>
                
                {results.map((res, index) => (
                  <div key={index} className="glass" style={{ 
                    padding: '24px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '12px',
                    borderLeft: '4px solid var(--accent-primary)',
                    background: 'rgba(255,255,255,0.01)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileText size={16} style={{ color: 'var(--accent-primary)' }} />
                        {res.title}
                      </span>
                      
                      <span className="badge badge-success" style={{ fontWeight: 600, fontSize: '0.75rem' }}>
                        {Math.round(res.score * 100)}% Match
                      </span>
                    </div>

                    <p style={{ 
                      color: 'var(--text-primary)', 
                      fontSize: '0.92rem', 
                      lineHeight: '1.6', 
                      background: 'rgba(255,255,255,0.02)',
                      padding: '16px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.03)',
                      fontStyle: 'italic'
                    }}>
                      "{renderSnippet(res.snippet)}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Search;
