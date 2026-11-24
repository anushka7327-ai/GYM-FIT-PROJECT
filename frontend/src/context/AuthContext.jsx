import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('gymfit_token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const fetchUser = async () => {
      const storedToken = localStorage.getItem('gymfit_token');
      if (!storedToken) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const response = await api.getMe();
        if (response.success && response.user) {
          setUser(response.user);
        } else {
          logout();
        }
      } catch (error) {
        console.error('Failed to load user:', error.message);
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await api.login({ email, password });
      if (data.token) {
        localStorage.setItem('gymfit_token', data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true, user: data.user };
      }
    } catch (error) {
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const data = await api.register(userData);
      if (data.token) {
        localStorage.setItem('gymfit_token', data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true, user: data.user };
      }
    } catch (error) {
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('gymfit_token');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const response = await api.getMe();
      if (response.success && response.user) {
        setUser(response.user);
      }
    } catch (e) {
      console.warn('Could not refresh user profile:', e);
    }
  };

  const isAdmin = user?.role === 'admin';
  const isTrainer = user?.role === 'trainer';
  const isMember = user?.role === 'member';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        refreshUser,
        isAdmin,
        isTrainer,
        isMember,
        role: user?.role,
      }}
    >
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
