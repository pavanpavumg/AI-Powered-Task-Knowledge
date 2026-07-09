import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/api';
import { 
  CheckSquare, Search, LogOut, CheckCircle2, Clock, 
  Layers, ShieldAlert 
} from 'lucide-react';

const UserDashboard = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeCompletingTaskId, setActiveCompletingTaskId] = useState(null);
  const [completionNote, setCompletionNote] = useState('');

  const fetchTasks = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/tasks');
      setTasks(response.data);
    } catch (err) {
      setError('Failed to fetch assigned tasks.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const submitCompletion = async (taskId) => {
    try {
      await api.patch(`/tasks/${taskId}/status`, { 
        status: 'completed',
        completion_note: completionNote.trim() || null
      });
      setActiveCompletingTaskId(null);
      setCompletionNote('');
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to complete task.');
    }
  };

  const handleReopenTask = async (taskId) => {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status: 'pending' });
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to reopen task.');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };

  const formatFullDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canReopen = (completedAtStr) => {
    if (!completedAtStr) return false;
    const completedTime = new Date(completedAtStr).getTime();
    const now = new Date().getTime();
    const diffInHours = (now - completedTime) / (1000 * 60 * 60);
    return diffInHours <= 24;
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
            User Panel
          </span>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          <button 
            className="btn btn-primary"
            style={{ justifyContent: 'flex-start', gap: '12px' }}
            onClick={() => navigate('/dashboard')}
          >
            <CheckSquare size={18} />
            My Tasks
          </button>
          
          <button 
            className="btn btn-ghost"
            style={{ justifyContent: 'flex-start', gap: '12px' }}
            onClick={() => navigate('/search')}
          >
            <Search size={18} />
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

      {/* Main Panel */}
      <main style={{ flex: 1, padding: '40px', overflowY: 'auto', maxHeight: '100vh' }}>
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '6px' }}>My Work Registry</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>View assigned deliverables and mark items completed.</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          {loading && tasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>Loading assigned tasks...</div>
          ) : tasks.length === 0 ? (
            <div className="glass" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
              <Layers size={40} style={{ color: 'var(--text-secondary)', opacity: 0.3, marginBottom: '16px' }} />
              <h3>All caught up!</h3>
              <p style={{ fontSize: '0.875rem', marginTop: '6px' }}>You have no pending tasks assigned at this moment.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px', alignItems: 'start' }}>
              {tasks.map(task => (
                <div key={task.id} className="glass" style={{ 
                  padding: '24px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '16px',
                  background: task.status === 'completed' ? 'rgba(34,197,94,0.01)' : 'var(--bg-glass)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, maxWidth: '70%', lineHeight: '1.4' }}>{task.title}</h3>
                    <span style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '4px',
                      fontSize: '0.75rem',
                      padding: '4px 10px',
                      borderRadius: '100px',
                      fontWeight: 600,
                      background: task.status === 'completed' ? 'rgba(34,197,94,0.1)' : 'rgba(234,179,8,0.1)',
                      color: task.status === 'completed' ? '#22c55e' : '#eab308'
                    }}>
                      {task.status === 'completed' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                      {task.status.toUpperCase()}
                    </span>
                  </div>

                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6', flex: 1 }}>
                    {task.description || 'No description provided.'}
                  </p>

                  {task.completion_note && (
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '12px',
                      fontSize: '0.85rem',
                      marginTop: '8px'
                    }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Completion Note:</div>
                      <div style={{ color: 'var(--text-secondary)', lineHeight: '1.4' }}>{task.completion_note}</div>
                    </div>
                  )}

                  {task.status === 'pending' && activeCompletingTaskId === task.id && (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      padding: '12px',
                      border: '1px dashed var(--border-color)',
                      borderRadius: '8px',
                      marginTop: '8px',
                      background: 'rgba(255, 255, 255, 0.01)'
                    }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Add a note about how you completed this (optional):</label>
                      <textarea
                        className="form-control"
                        rows="2"
                        maxLength="500"
                        placeholder="e.g. Verified layout on chrome and safari..."
                        value={completionNote}
                        onChange={(e) => setCompletionNote(e.target.value)}
                        style={{ fontSize: '0.85rem' }}
                      />
                      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                        <button 
                          className="btn btn-primary btn-sm"
                          style={{ fontSize: '0.75rem' }}
                          onClick={() => submitCompletion(task.id)}
                        >
                          Confirm
                        </button>
                        <button 
                          className="btn btn-outline btn-sm"
                          style={{ fontSize: '0.75rem' }}
                          onClick={() => {
                            setActiveCompletingTaskId(null);
                            setCompletionNote('');
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    fontSize: '0.8rem', 
                    color: 'var(--text-secondary)', 
                    borderTop: '1px solid var(--border-color)', 
                    paddingTop: '16px',
                    marginTop: '4px'
                  }}>
                    <span>Assigned: {formatDate(task.created_at)}</span>
                    
                    {task.status === 'pending' && activeCompletingTaskId !== task.id && (
                      <button 
                        className="btn btn-primary btn-sm"
                        style={{ fontSize: '0.75rem', padding: '6px 12px' }}
                        onClick={() => {
                          setActiveCompletingTaskId(task.id);
                          setCompletionNote('');
                        }}
                      >
                        Mark Completed
                      </button>
                    )}

                    {task.status === 'completed' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span>Finished: {formatFullDate(task.completed_at)}</span>
                        {canReopen(task.completed_at) && (
                          <button
                            className="btn btn-outline btn-sm"
                            style={{ 
                              fontSize: '0.75rem', 
                              padding: '4px 8px', 
                              borderColor: 'var(--accent-primary)', 
                              color: 'var(--accent-primary)',
                              marginLeft: '8px'
                            }}
                            onClick={() => handleReopenTask(task.id)}
                          >
                            Reopen
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
