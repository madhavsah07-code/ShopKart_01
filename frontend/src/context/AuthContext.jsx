import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getProfile, loginCustomer as apiLogin, logoutCustomer as apiLogout } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  const checkAuth = useCallback(async () => {
    try {
      const data = await getProfile();
      setCustomer(data);
    } catch {
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Login handler
  const login = async ({ email, password }) => {
    await apiLogin({ email, password });
    const profile = await getProfile();
    setCustomer(profile);
    return profile;
  };

  // Logout handler
  const logout = async () => {
    try {
      await apiLogout();
    } finally {
      setCustomer(null);
    }
  };

  const refreshAuth = async () => {
    try {
      const profile = await getProfile();
      setCustomer(profile);
      return profile;
    } catch {
      setCustomer(null);
      return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        customer,
        isAuthenticated: !!customer,
        loading,
        login,
        logout,
        refreshAuth,
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

export default AuthContext;
