import React from 'react';
import { Calendar, User, Trash2 } from 'lucide-react';

const TaskCard = ({ task, currentUserId, currentUserRole, onStatusChange, onDelete }) => {
  const isCreatorOrAdmin = currentUserRole === 'Admin' || currentUserRole === 'Manager' || task.creator_id === currentUserId;
  const isAssignee = task.assignee_id === currentUserId;
  const canModifyStatus = isCreatorOrAdmin || isAssignee;
  
  const formatDate = (dateStr) => {
    if (!dateStr) return 'No due date';
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="glass animate-fade-in" style={{
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      position: 'relative'
    }}>
      {/* Header and Delete */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span className={`badge badge-${task.priority.toLowerCase()}`}>
          {task.priority} Priority
        </span>
        <div style={{ display: 'flex', gap: '8px' }}>
          {isCreatorOrAdmin && onDelete && (
            <button 
              onClick={() => onDelete(task.id)}
              className="btn btn-secondary"
              style={{ padding: '6px', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.1)' }}
              title="Delete Task"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Task Details */}
      <div>
        <h3 style={{ fontSize: '1.15rem', marginBottom: '6px', color: 'var(--text-primary)' }}>{task.title}</h3>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
          {task.description || 'No description provided.'}
        </p>
      </div>

      {/* Metadata */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        fontSize: '0.8rem',
        color: 'var(--text-muted)',
        borderTop: '1px solid var(--card-border)',
        paddingTop: '12px',
        marginTop: 'auto'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Calendar size={14} />
          <span>{formatDate(task.due_date)}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <User size={14} />
          <span>Assignee: {task.assignee ? `@${task.assignee.username}` : 'Unassigned'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}>
          <span style={{ fontSize: '0.75rem' }}>By @{task.creator.username}</span>
        </div>
      </div>

      {/* Task State Action Buttons */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
        {['todo', 'in_progress', 'completed'].map((statusOption) => (
          <button
            key={statusOption}
            disabled={!canModifyStatus}
            onClick={() => onStatusChange(task.id, statusOption)}
            className="btn"
            style={{
              flex: 1,
              padding: '6px 0',
              fontSize: '0.78rem',
              borderRadius: '8px',
              textTransform: 'capitalize',
              backgroundColor: task.status === statusOption 
                ? (statusOption === 'completed' ? 'rgba(16, 185, 129, 0.15)' : statusOption === 'in_progress' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(245, 158, 11, 0.15)') 
                : 'rgba(255, 255, 255, 0.02)',
              border: '1px solid',
              borderColor: task.status === statusOption
                ? (statusOption === 'completed' ? '#10b981' : statusOption === 'in_progress' ? '#6366f1' : '#f59e0b')
                : 'var(--card-border)',
              color: task.status === statusOption
                ? (statusOption === 'completed' ? '#34d399' : statusOption === 'in_progress' ? '#818cf8' : '#fbbf24')
                : 'var(--text-secondary)'
            }}
          >
            {statusOption.replace('_', ' ')}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TaskCard;
