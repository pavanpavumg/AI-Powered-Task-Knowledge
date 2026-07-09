import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Unauthorized = () => {
  const navigate = useNavigate();
  const { role } = useAuth();

  const handleGoBack = () => {
    if (role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      padding: '20px',
      textAlign: 'center'
    }}>
      <h1 className="gradient-text" style={{ fontSize: '3rem', marginBottom: '16px' }}>403</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '1.1rem' }}>
        You do not have authorization to view this resource.
      </p>
      <button className="btn btn-primary" onClick={handleGoBack}>
        Go to Dashboard
      </button>
    </div>
  );
};

export default Unauthorized;
