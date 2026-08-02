import { createContext, useContext, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const queryClient = useQueryClient();

  const { data: user, isLoading: loading } = useQuery({
    queryKey: ['me', token],
    queryFn: async () => {
      try {
        return (await apiClient.get('/api/me')).data.user;
      } catch (err) {
        localStorage.removeItem('token');
        setToken(null);
        throw err;
      }
    },
    enabled: !!token,
    retry: false,
  });

  function login(newToken) {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  }

  function logout() {
    localStorage.removeItem('token');
    setToken(null);
    queryClient.clear();
  }

  return (
    <AuthContext.Provider value={{ token, user: user || null, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
