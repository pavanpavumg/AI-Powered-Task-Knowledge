import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckSquare, FileText, Search, BarChart3, Users, LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const isAdmin = user.role.name === 'Admin';
  const isManager = user.role.name === 'Manager';
  const hasAnalyticsAccess = isAdmin || isManager;

  return (
    <aside className="glass" style={{
      width: '260px',
      height: '100vh',
      position: 'fixed',
      top: 0,
      left: 0,
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 16px',
      borderRadius: '0 var(--radius-lg) var(--radius-lg) 0',
      borderLeft: 'none',
      zIndex: 100,
    }}>
      {/* Brand Title */}
      <div style={{ marginBottom: '32px', padding: '0 8px' }}>
        <h2 className="gradient-text" style={{ fontSize: '1.45rem', fontWeight: 800, fontFamily: 'var(--font-title)' }}>
          TaskSphere KMS
        </h2>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          AI Knowledge Portal
        </span>
      </div>

      {/* Navigation Links */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        <NavLink
          to="/"
          className={({ isActive }) => `btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
          style={{ justifyContent: 'flex-start', width: '100%', gap: '12px' }}
        >
          <CheckSquare size={18} />
          <span>Tasks</span>
        </NavLink>

        <NavLink
          to="/documents"
          className={({ isActive }) => `btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
          style={{ justifyContent: 'flex-start', width: '100%', gap: '12px' }}
        >
          <FileText size={18} />
          <span>Documents</span>
        </NavLink>

        <NavLink
          to="/search"
          className={({ isActive }) => `btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
          style={{ justifyContent: 'flex-start', width: '100%', gap: '12px' }}
        >
          <Search size={18} />
          <span>Semantic Search</span>
        </NavLink>

        {hasAnalyticsAccess && (
          <NavLink
            to="/analytics"
            className={({ isActive }) => `btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
            style={{ justifyContent: 'flex-start', width: '100%', gap: '12px' }}
          >
            <BarChart3 size={18} />
            <span>Analytics</span>
          </NavLink>
        )}

        {isAdmin && (
          <NavLink
            to="/admin"
            className={({ isActive }) => `btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
            style={{ justifyContent: 'flex-start', width: '100%', gap: '12px' }}
          >
            <Users size={18} />
            <span>Admin Control</span>
          </NavLink>
        )}
      </nav>

      {/* User Session Block */}
      <div style={{
        marginTop: 'auto',
        paddingTop: '20px',
        borderTop: '1px solid var(--card-border)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', padding: '0 8px' }}>
          <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
            @{user.username}
          </span>
          <span className={`badge badge-${user.role.name.toLowerCase()}`} style={{ alignSelf: 'flex-start', marginTop: '4px', fontSize: '0.65rem' }}>
            {user.role.name}
          </span>
        </div>
        
        <button
          onClick={logout}
          className="btn btn-secondary"
          style={{ justifyContent: 'flex-start', width: '100%', gap: '12px', borderColor: 'rgba(239, 68, 68, 0.2)', color: '#f87171' }}
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Navbar;
