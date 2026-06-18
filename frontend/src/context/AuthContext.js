import React, { createContext, useState, useEffect, useCallback } from 'react';
import authAPI from '../api/authAPI';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch {
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  useEffect(() => {
    const handleAuthLogout = () => {
      setUser(null);
      setIsAuthenticated(false);
    };

    window.addEventListener('auth:logout', handleAuthLogout);
    return () => window.removeEventListener('auth:logout', handleAuthLogout);
  }, []);

  useEffect(() => {
    const hydrate = async () => {
      try {
        const data = await authAPI.getMe();
        setUser(data.user);
        setIsAuthenticated(true);
      } catch {
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    hydrate();
  }, []);

  const login = async (email, password) => {
    const data = await authAPI.login({ email, password });
    setUser(data.user);
    setIsAuthenticated(true);
    return data.user;
  };

  const register = async (name, email, password, role) => {
    const data = await authAPI.register({ name, email, password, role });
    setUser(data.user);
    setIsAuthenticated(true);
    return data.user;
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
