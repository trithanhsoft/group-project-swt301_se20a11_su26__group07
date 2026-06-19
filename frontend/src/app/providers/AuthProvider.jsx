import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiClient, clearAuthToken, setAuthToken } from '../../services/apiClient.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      setIsBootstrapping(false);
      return;
    }

    setAuthToken(token);

    apiClient
      .get('/auth/me')
      .then((response) => {
        setUser(response.data.user);
      })
      .catch(() => {
        clearAuthToken();
        setUser(null);
      })
      .finally(() => {
        setIsBootstrapping(false);
      });
  }, []);

  const login = async ({ username, password }) => {
    const response = await apiClient.post('/auth/login', { username, password });
    const { token, user: loggedInUser } = response.data;

    setAuthToken(token);
    setUser(loggedInUser);

    return loggedInUser;
  };

  const logout = () => {
    clearAuthToken();
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isBootstrapping,
      login,
      logout,
    }),
    [user, isBootstrapping],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
