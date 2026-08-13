import { createContext, useContext, useState, useEffect } from 'react';
import { loginApi, registerApi, getMeApi } from '../api/authApi.js';

export const ROLES = {
  ATHLETE: 'athlete',
  COACH: 'coach',
  ADMIN: 'admin',
};

export const getDashboardRoute = (role) => {
  switch (role) {
    case 'coach':
      return '/dashboard/coach';
    case 'admin':
      return '/dashboard/admin';
    case 'athlete':
    default:
      return '/dashboard/athlete';
  }
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('authToken') || null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const role = user?.role || ROLES.ATHLETE;

  // On initial mount, verify token if present in localStorage
  useEffect(() => {
    async function initAuth() {
      const storedToken = localStorage.getItem('authToken');
      if (storedToken) {
        try {
          const data = await getMeApi(storedToken);
          if (data.success && data.user) {
            setUser(data.user);
            setToken(storedToken);
          } else {
            // Invalid session
            localStorage.removeItem('authToken');
            setToken(null);
            setUser(null);
          }
        } catch (err) {
          console.error('Session restoration failed:', err);
          localStorage.removeItem('authToken');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    }

    initAuth();
  }, []);

  const login = async (email, password) => {
    setAuthError(null);
    try {
      const response = await loginApi({ email, password });
      if (response.token) {
        localStorage.setItem('authToken', response.token);
        setToken(response.token);
        setUser(response.user);
        return {
          success: true,
          redirectUrl: response.redirectUrl || getDashboardRoute(response.user.role),
          user: response.user,
        };
      }
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  const register = async (name, email, password, roleChoice) => {
    setAuthError(null);
    try {
      const response = await registerApi({
        name,
        email,
        password,
        role: roleChoice,
      });
      if (response.token) {
        localStorage.setItem('authToken', response.token);
        setToken(response.token);
        setUser(response.user);
        return {
          success: true,
          redirectUrl: response.redirectUrl || getDashboardRoute(response.user.role),
          user: response.user,
        };
      }
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
    setAuthError(null);
  };

  const value = {
    user,
    token,
    role,
    isAuthenticated: !!token && !!user,
    isLoading,
    authError,
    login,
    register,
    logout,
    getDashboardRoute,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
