import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function useAuthCallback() {
  const { token, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    navigate(token ? '/files' : '/login', { replace: true });
  }, [token, loading, navigate]);
}
