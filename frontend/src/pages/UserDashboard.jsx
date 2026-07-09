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

  const handleMarkCompleted = async (taskId) => {
    // Optimistic UI update: update status instantly in the state
    const originalTasks = [...tasks];
    setTasks(prev => 
      prev.map(task => 
        task.id === taskId ? { ...task, status: 'completed' } : task
      )
    );

    try {
      await api.patch(`/tasks/${taskId}/status`, { status: 'completed' });
    } catch (err) {
      // Revert state if API request fails
      setTasks(originalTasks);
      alert(err.response?.data?.detail || 'Failed to complete task. Reverting update.');
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
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

                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    fontSize: '0.8rem', 
                    color: 'var(--text-secondary)', 
                    borderTop: '1px solid var(--border-color)', 
                    paddingTop: '16px'
                  }}>
                    <span>Assigned: {formatDate(task.created_at)}</span>
                    
                    {task.status === 'pending' && (
                      <button 
                        className="btn btn-primary btn-sm"
                        style={{ fontSize: '0.75rem', padding: '6px 12px' }}
                        onClick={() => handleMarkCompleted(task.id)}
                      >
                        Mark Completed
                      </button>
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
