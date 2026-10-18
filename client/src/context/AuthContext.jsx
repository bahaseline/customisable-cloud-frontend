import { createContext, useContext, useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient, { API_BASE_URL } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('accessToken'));
  const [sessionExpired, setSessionExpired] = useState(false);
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

  useEffect(() => {
    function handleSignout() {
      setToken(null);
      setSessionExpired(true);
      queryClient.clear();
    }
    window.addEventListener('auth:signout', handleSignout);
    return () => window.removeEventListener('auth:signout', handleSignout);
  }, [queryClient]);

  function login(accessToken, refreshToken) {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    setToken(accessToken);
    setSessionExpired(false);
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
      {sessionExpired && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-2xl dark:bg-grey-850">
            <p className="text-lg font-semibold text-grey-900 dark:text-grey-100">Session expired</p>
            <p className="mt-2 text-sm text-grey-600 dark:text-grey-400">
              Your Google session has expired. Sign in again to continue.
            </p>
            <a
              href={`${API_BASE_URL}/auth/google`}
              className="mt-6 flex w-full items-center justify-center gap-3 rounded-lg border border-grey-300 bg-white px-4 py-2.5 text-sm font-medium text-grey-700 shadow-sm transition hover:bg-grey-50 dark:border-grey-700 dark:bg-grey-800 dark:text-grey-200 dark:hover:bg-grey-750"
            >
              Sign in with Google
            </a>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
