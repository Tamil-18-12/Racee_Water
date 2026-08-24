import React, { createContext, useContext, useState, useCallback } from 'react';
import { login as loginApi } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('watercan_token'));
  const [owner, setOwner] = useState(() => {
    const stored = localStorage.getItem('watercan_owner');
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback(async (ownerId, password) => {
    const response = await loginApi({ ownerId, password });
    const { token: newToken, ownerId: id, role } = response.data.data;
    localStorage.setItem('watercan_token', newToken);
    const ownerData = { ownerId: id, role };
    localStorage.setItem('watercan_owner', JSON.stringify(ownerData));
    setToken(newToken);
    setOwner(ownerData);
    return ownerData;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('watercan_token');
    localStorage.removeItem('watercan_owner');
    setToken(null);
    setOwner(null);
  }, []);

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, owner, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
