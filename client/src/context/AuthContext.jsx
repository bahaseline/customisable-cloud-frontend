import { createContext, useContext, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('accessToken'));
  const queryClient = useQueryClient();

  const { data: user, isLoading: loading } = useQuery({
    queryKey: ['me', token],
    queryFn: async () => {
      try {
        return (await apiClient.get('/api/me')).data.user;
      } catch (err) {
        // If the access token is invalid or expired, clear it and the refresh token from localStorage and reset the token state.
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setToken(null);
        throw err;
      }
    },
    enabled: !!token,
    retry: false,
  });

  function login(accessToken, refreshToken) {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    setToken(accessToken);
  }

  async function logout() {
    const refreshToken = localStorage.getItem('refreshToken');
    try {
      await apiClient.post('/auth/logout', { refreshToken });
    } catch (err) {
      console.error('Could not revoke Google access on logout:', err.message);
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
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
