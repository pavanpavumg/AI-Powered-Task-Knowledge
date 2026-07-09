import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [role, setRole] = useState(localStorage.getItem('role') || null);
  const [user, setUser] = useState(null);

  const parseJwt = (tokenStr) => {
    try {
      return JSON.parse(atob(tokenStr.split('.')[1]));
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    if (token) {
      const payload = parseJwt(token);
      if (payload) {
        setUser({
          id: payload.sub,
          email: payload.email,
        });
        setRole(payload.role);
      } else {
        logout();
      }
    } else {
      setUser(null);
      setRole(null);
    }
  }, [token]);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { access_token, role: userRole } = response.data;
    
    localStorage.setItem('token', access_token);
    localStorage.setItem('role', userRole);
    
    setToken(access_token);
    setRole(userRole);
    
    const payload = parseJwt(access_token);
    if (payload) {
      setUser({
        id: payload.sub,
        email: payload.email,
      });
    }
    return userRole;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setToken(null);
    setRole(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
