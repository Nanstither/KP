import { createContext, useState, useEffect, useContext } from 'react';
import api from '@/services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Проверка авторизации при загрузке
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await api.get('/me');
      setUser(response.data.user);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await api.post('/login', { email, password });
    setUser(response.data.user);
    return response.data.user;
  };

  const register = async (name, email, password, password_confirmation) => {
    const response = await api.post('/register', {
      name,
      email,
      password,
      password_confirmation,
    });
    setUser(response.data.user);
    return response.data.user;
  };

  const logout = async () => {
    await api.post('/logout');
    setUser(null);
  };

  const isAdmin = () => user?.role === 'admin';
  const isManager = () => user?.role === 'manager' || user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      register, 
      logout, 
      checkAuth,
      isAdmin,
      isManager 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);