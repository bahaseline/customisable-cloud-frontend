import { useAuthCallback } from '../hooks/useAuthCallback';
import FullScreenCenter from '../components/FullScreenCenter';
import Spinner from '../components/Spinner';

export default function AuthCallback() {
  useAuthCallback();

  return (
    <FullScreenCenter>
      <div className="flex flex-col items-center gap-3 text-slate-500 dark:text-grey-500">
        <Spinner />
        <p className="text-sm">Signing you in…</p>
      </div>
    </FullScreenCenter>
  );
}
