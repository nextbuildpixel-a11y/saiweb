import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [role, setRole] = useState(() => localStorage.getItem('role') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      if (token && role === 'ROLE_USER') {
        try {
          const profileData = await authService.getProfile();
          setUser(profileData);
          localStorage.setItem('user', JSON.stringify(profileData));
        } catch (err) {
          console.error('Session verification failed, logging out', err);
          logout();
        }
      }
      setLoading(false);
    };
    verifyAuth();
  }, [token, role]);

  const loginStudent = async (email, password) => {
    const data = await authService.loginStudent({ email, password });
    setToken(data.token);
    setRole(data.role);
    const userInfo = { id: data.id, fullName: data.fullName, email: data.email, role: data.role };
    setUser(userInfo);

    localStorage.setItem('token', data.token);
    localStorage.setItem('role', data.role);
    localStorage.setItem('user', JSON.stringify(userInfo));
    return data;
  };

  const loginAdmin = async (email, password) => {
    const data = await authService.loginAdmin({ email, password });
    setToken(data.token);
    setRole(data.role);
    const userInfo = { id: data.id, fullName: data.fullName, email: data.email, role: data.role };
    setUser(userInfo);

    localStorage.setItem('token', data.token);
    localStorage.setItem('role', data.role);
    localStorage.setItem('user', JSON.stringify(userInfo));
    return data;
  };

  const registerStudent = async (studentData) => {
    const data = await authService.registerStudent(studentData);
    setToken(data.token);
    setRole(data.role);
    const userInfo = { id: data.id, fullName: data.fullName, email: data.email, role: data.role };
    setUser(userInfo);

    localStorage.setItem('token', data.token);
    localStorage.setItem('role', data.role);
    localStorage.setItem('user', JSON.stringify(userInfo));
    return data;
  };

  const updateUser = (updatedData) => {
    setUser(prev => {
      const merged = { ...prev, ...updatedData };
      localStorage.setItem('user', JSON.stringify(merged));
      return merged;
    });
  };

  const refreshProfile = async () => {
    if (token && role === 'ROLE_USER') {
      try {
        const profileData = await authService.getProfile();
        setUser(profileData);
        localStorage.setItem('user', JSON.stringify(profileData));
        return profileData;
      } catch (err) {
        console.error('Failed to refresh profile', err);
      }
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setRole(null);
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      role,
      loading,
      loginStudent,
      loginAdmin,
      registerStudent,
      updateUser,
      refreshProfile,
      logout,
      isAuthenticated: !!token,
      isStudent: role === 'ROLE_USER',
      isAdmin: role === 'ROLE_ADMIN'
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
