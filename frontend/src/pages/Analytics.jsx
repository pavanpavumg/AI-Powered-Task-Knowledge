import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { BarChart3, Clock, CheckCircle2, FileText, UserCheck } from 'lucide-react';

const Analytics = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [statsRes, logsRes] = await Promise.all([
        api.get('/analytics/stats'),
        api.get('/analytics/logs')
      ]);
      setStats(statsRes.data);
      setLogs(logsRes.data);
    } catch (e) {
      console.error('Error fetching analytics', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <span className="gradient-text" style={{ fontSize: '1.25rem', fontWeight: 500 }}>Aggregating system statistics and activity feeds...</span>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="glass" style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Failed to load dashboard metrics.</p>
      </div>
    );
  }

  const todoCount = stats.tasks_by_status.todo || 0;
  const inProgressCount = stats.tasks_by_status.in_progress || 0;
  const completedCount = stats.tasks_by_status.completed || 0;
  const totalTasks = stats.total_tasks;
  const completionRate = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  const lowPriorityCount = stats.tasks_by_priority.low || 0;
  const mediumPriorityCount = stats.tasks_by_priority.medium || 0;
  const highPriorityCount = stats.tasks_by_priority.high || 0;

  const maxStatusCount = Math.max(todoCount, inProgressCount, completedCount, 1);
  const getBarHeight = (count) => (count / maxStatusCount) * 120;

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) + ' ' + 
           date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>
      {/* Title */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '2.1rem', marginBottom: '4px' }}>Analytics & Audit Logs</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Real-time metrics, project completion rates, and event logs.
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <div className="glass" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', background: 'rgba(99, 102, 241, 0.12)', color: 'var(--primary)', borderRadius: '12px' }}>
            <BarChart3 size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Tasks</span>
            <h2 style={{ fontSize: '2rem', marginTop: '2px' }}>{totalTasks}</h2>
          </div>
        </div>

        <div className="glass" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', background: 'rgba(6, 182, 212, 0.12)', color: 'var(--accent)', borderRadius: '12px' }}>
            <FileText size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Documents Vault</span>
            <h2 style={{ fontSize: '2rem', marginTop: '2px' }}>{stats.total_documents}</h2>
          </div>
        </div>

        <div className="glass" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.12)', color: 'var(--success)', borderRadius: '12px' }}>
            <UserCheck size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Users</span>
            <h2 style={{ fontSize: '2rem', marginTop: '2px' }}>{stats.total_users}</h2>
          </div>
        </div>

        <div className="glass" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', background: 'rgba(139, 92, 246, 0.12)', color: 'var(--secondary)', borderRadius: '12px' }}>
            <Clock size={24} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Completion Rate</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
              <h2 style={{ fontSize: '2rem' }}>{completionRate}%</h2>
              <div style={{ flex: 1, height: '4px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: `${completionRate}%`, height: '100%', background: 'var(--secondary)' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SVG Charts Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        {/* Status Bar Chart */}
        <div className="glass" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '24px', fontFamily: 'var(--font-title)', color: 'var(--text-primary)' }}>
            Tasks by Status
          </h3>
          <div style={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'flex-end',
            height: '160px',
            borderBottom: '1px solid var(--card-border)',
            paddingBottom: '12px'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '60px' }}>
              <span style={{ fontSize: '0.85rem', color: '#fbbf24', fontWeight: 600 }}>{todoCount}</span>
              <div style={{
                width: '32px',
                height: `${getBarHeight(todoCount)}px`,
                background: 'linear-gradient(to top, rgba(245, 158, 11, 0.1) 0%, #f59e0b 100%)',
                borderRadius: '6px 6px 0 0',
                border: '1px solid rgba(245, 158, 11, 0.3)'
              }} />
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Todo</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '60px' }}>
              <span style={{ fontSize: '0.85rem', color: '#818cf8', fontWeight: 600 }}>{inProgressCount}</span>
              <div style={{
                width: '32px',
                height: `${getBarHeight(inProgressCount)}px`,
                background: 'linear-gradient(to top, rgba(99, 102, 241, 0.1) 0%, #6366f1 100%)',
                borderRadius: '6px 6px 0 0',
                border: '1px solid rgba(99, 102, 241, 0.3)'
              }} />
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Active</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '60px' }}>
              <span style={{ fontSize: '0.85rem', color: '#34d399', fontWeight: 600 }}>{completedCount}</span>
              <div style={{
                width: '32px',
                height: `${getBarHeight(completedCount)}px`,
                background: 'linear-gradient(to top, rgba(16, 185, 129, 0.1) 0%, #10b981 100%)',
                borderRadius: '6px 6px 0 0',
                border: '1px solid rgba(16, 185, 129, 0.3)'
              }} />
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Done</span>
            </div>
          </div>
        </div>

        {/* SVG Donut Ring Chart */}
        <div className="glass" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '20px', fontFamily: 'var(--font-title)', color: 'var(--text-primary)' }}>
            Priority Distribution
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '32px', flex: 1 }}>
            <div style={{ position: 'relative', width: '130px', height: '130px' }}>
              <svg width="130" height="130" viewBox="0 0 42 42">
                <circle cx="21" cy="21" r="15.915" fill="transparent" />
                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="3.5" />
                
                {totalTasks > 0 && (() => {
                  const pLow = (lowPriorityCount / totalTasks) * 100;
                  const pMedium = (mediumPriorityCount / totalTasks) * 100;
                  const pHigh = (highPriorityCount / totalTasks) * 100;
                  
                  return (
                    <>
                      <circle cx="21" cy="21" r="15.915" fill="transparent" 
                              stroke="#ef4444" strokeWidth="4" 
                              strokeDasharray={`${pHigh} ${100 - pHigh}`} 
                              strokeDashoffset="25" />
                      <circle cx="21" cy="21" r="15.915" fill="transparent" 
                              stroke="#f59e0b" strokeWidth="4" 
                              strokeDasharray={`${pMedium} ${100 - pMedium}`} 
                              strokeDashoffset={25 - pHigh} />
                      <circle cx="21" cy="21" r="15.915" fill="transparent" 
                              stroke="#9ca3af" strokeWidth="4" 
                              strokeDasharray={`${pLow} ${100 - pLow}`} 
                              strokeDashoffset={25 - pHigh - pMedium} />
                    </>
                  );
                })()}
              </svg>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: '0.85rem'
              }}>
                <span style={{ fontWeight: 700, fontSize: '1.25rem' }}>{totalTasks}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem', textTransform: 'uppercase' }}>Tasks</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.86rem' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: '#ef4444' }} />
                <span style={{ color: 'var(--text-secondary)' }}>High ({highPriorityCount})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.86rem' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: '#f59e0b' }} />
                <span style={{ color: 'var(--text-secondary)' }}>Medium ({mediumPriorityCount})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.86rem' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: '#9ca3af' }} />
                <span style={{ color: 'var(--text-secondary)' }}>Low ({lowPriorityCount})</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Audit Logs List */}
      <div className="glass" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-title)', color: 'var(--text-primary)' }}>
            System Audit logs
          </h3>
          <button onClick={fetchAnalytics} className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '0.78rem' }}>
            Refresh Logs
          </button>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          maxHeight: '400px',
          overflowY: 'auto',
          paddingRight: '8px'
        }}>
          {logs.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>No system events logged.</p>
          ) : (
            logs.map((log) => {
              const isTask = log.target_type === 'task';
              return (
                <div key={log.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '12px 16px',
                  background: 'rgba(255, 255, 255, 0.015)',
                  border: '1px solid rgba(255, 255, 255, 0.02)',
                  borderRadius: '10px',
                  fontSize: '0.88rem'
                }}>
                  <div style={{
                    background: isTask ? 'rgba(99, 102, 241, 0.08)' : 'rgba(6, 182, 212, 0.08)',
                    color: isTask ? 'var(--primary)' : 'var(--accent)',
                    padding: '8px',
                    borderRadius: '8px'
                  }}>
                    {isTask ? <CheckCircle2 size={16} /> : <FileText size={16} />}
                  </div>

                  <div style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>@{log.username}</span>
                    <span style={{ color: 'var(--text-secondary)' }}> {log.action} </span>
                    <span style={{ color: 'var(--text-muted)' }}>{log.target_type}</span>
                    {log.target_id && <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}> (ID: #{log.target_id})</span>}
                  </div>

                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {formatDate(log.timestamp)}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
