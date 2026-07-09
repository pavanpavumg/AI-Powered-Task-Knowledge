import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import { Lock, Mail, Shield, CheckCircle2, User } from 'lucide-react';

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusName, setFocusName] = useState(false);
  const [focusEmail, setFocusEmail] = useState(false);
  const [focusPassword, setFocusPassword] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        // Register the new user account (automatically gets assigned the 'user' role)
        await api.post('/auth/register', { name, email, password });
      }
      
      // Authenticate and log in the session
      const userRole = await login(email, password);
      if (userRole === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Authentication failed. Please verify your entries.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#07080e',
      backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.15) 0%, rgba(0, 0, 0, 0) 70%)',
      padding: '20px',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: '#0d0f17',
        border: '2px solid #4f46e5',
        borderRadius: '16px',
        padding: '40px 32px',
        boxShadow: '0 0 30px rgba(79, 70, 229, 0.25)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Glow accent line at top */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #6366f1, #a855f7)'
        }} />

        {/* Logo and title */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex',
            padding: '12px',
            borderRadius: '12px',
            background: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            color: '#818cf8',
            marginBottom: '16px'
          }}>
            <Shield size={28} />
          </div>
          <h1 style={{ 
            fontSize: '2.25rem', 
            fontWeight: 900, 
            marginBottom: '8px', 
            letterSpacing: '-0.025em',
            background: 'linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            TaskSphere
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.92rem', fontWeight: 500 }}>
            {isSignUp ? 'Create a new user account' : 'Knowledge Management System v2'}
          </p>
        </div>

        {error && (
          <div style={{ 
            marginBottom: '24px', 
            fontSize: '0.875rem',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1.5px solid #f87171',
            color: '#fca5a5',
            padding: '12px 16px',
            borderRadius: '8px',
            fontWeight: 600,
            lineHeight: '1.4'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Full Name (Only shown on signup) */}
          {isSignUp && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ 
                color: '#ffffff', 
                fontSize: '0.875rem', 
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Full Name
              </label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                background: '#090a0f',
                border: focusName ? '2px solid #818cf8' : '1px solid #334155',
                borderRadius: '8px',
                padding: '0 16px',
                transition: 'border-color 0.2s',
                height: '48px',
                boxShadow: focusName ? '0 0 10px rgba(99, 102, 241, 0.3)' : 'none'
              }}>
                <span style={{ color: focusName ? '#818cf8' : '#64748b', marginRight: '12px', display: 'flex', alignItems: 'center' }}>
                  <User size={18} />
                </span>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={() => setFocusName(true)}
                  onBlur={() => setFocusName(false)}
                  style={{
                    flex: 1,
                    background: 'none',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '0.95rem',
                    outline: 'none',
                    width: '100%',
                    fontWeight: 500
                  }}
                />
              </div>
            </div>
          )}

          {/* Email input group */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ 
              color: '#ffffff', 
              fontSize: '0.875rem', 
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Email Address
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: '#090a0f',
              border: focusEmail ? '2px solid #818cf8' : '1px solid #334155',
              borderRadius: '8px',
              padding: '0 16px',
              transition: 'border-color 0.2s',
              height: '48px',
              boxShadow: focusEmail ? '0 0 10px rgba(99, 102, 241, 0.3)' : 'none'
            }}>
              <span style={{ color: focusEmail ? '#818cf8' : '#64748b', marginRight: '12px', display: 'flex', alignItems: 'center' }}>
                <Mail size={18} />
              </span>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusEmail(true)}
                onBlur={() => setFocusEmail(false)}
                style={{
                  flex: 1,
                  background: 'none',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '0.95rem',
                  outline: 'none',
                  width: '100%',
                  fontWeight: 500
                }}
              />
            </div>
          </div>

          {/* Password input group */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ 
              color: '#ffffff', 
              fontSize: '0.875rem', 
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Password
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: '#090a0f',
              border: focusPassword ? '2px solid #818cf8' : '1px solid #334155',
              borderRadius: '8px',
              padding: '0 16px',
              transition: 'border-color 0.2s',
              height: '48px',
              boxShadow: focusPassword ? '0 0 10px rgba(99, 102, 241, 0.3)' : 'none'
            }}>
              <span style={{ color: focusPassword ? '#818cf8' : '#64748b', marginRight: '12px', display: 'flex', alignItems: 'center' }}>
                <Lock size={18} />
              </span>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusPassword(true)}
                onBlur={() => setFocusPassword(false)}
                style={{
                  flex: 1,
                  background: 'none',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '0.95rem',
                  outline: 'none',
                  width: '100%',
                  fontWeight: 500
                }}
              />
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              height: '48px',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
              color: '#ffffff',
              fontSize: '1rem',
              fontWeight: 800,
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '12px',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.4)',
              transition: 'transform 0.1s, opacity 0.2s',
              opacity: loading ? 0.7 : 1,
              letterSpacing: '0.025em'
            }}
            onMouseDown={(e) => {
              if (!loading) e.currentTarget.style.transform = 'scale(0.98)';
            }}
            onMouseUp={(e) => {
              if (!loading) e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {loading 
              ? 'Processing Session...' 
              : isSignUp 
                ? 'Create Secure Account' 
                : 'Secure Sign In'
            }
          </button>
        </form>

        {/* Toggle signin/signup */}
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
              setName('');
              setEmail('');
              setPassword('');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#818cf8',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {isSignUp 
              ? 'Already have an account? Sign In' 
              : "Need a user account? Register here"
            }
          </button>
        </div>

        {/* Security badge footer */}
        <div style={{ 
          marginTop: '32px', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          gap: '8px', 
          color: '#4ade80', 
          fontSize: '0.85rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          <CheckCircle2 size={14} />
          <span>AES-256 Bit SSL Session</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
