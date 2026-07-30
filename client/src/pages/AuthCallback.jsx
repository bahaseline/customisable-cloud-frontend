import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FullScreenCenter from '../components/FullScreenCenter';
import Spinner from '../components/Spinner';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      login(token);
      navigate('/files', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <FullScreenCenter>
      <div className="flex flex-col items-center gap-3 text-slate-500 dark:text-[#9aa0a6]">
        <Spinner />
        <p className="text-sm">Signing you in…</p>
      </div>
    </FullScreenCenter>
  );
}
