import { API_BASE_URL } from '../api/client';
import ThemeToggle from '../components/ThemeToggle';
import Logo from '../components/Logo';

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.5 0 10.5-2.1 14.3-5.6l-6.6-5.6C29.6 34.6 26.9 35.5 24 35.5c-5.2 0-9.6-3.1-11.3-7.6l-6.6 5.1C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.3-4.1 5.7l6.6 5.6C40.9 36.5 44 30.8 44 24c0-1.3-.1-2.7-.4-3.5z"
      />
    </svg>
  );
}

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 px-4 dark:from-[#202124] dark:via-[#202124] dark:to-[#1a2233]">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-200/50 dark:border-[#3c4043] dark:bg-[#292a2d] dark:shadow-none">
        <Logo className="mx-auto mb-5 h-14 w-14 text-blue-600 dark:text-[#8ab4f8]" />
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-[#e8eaed]">Driveboard</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-[#9aa0a6]">
          Your frequently-used Google Drive files, organised in one place.
        </p>
        <a
          href={`${API_BASE_URL}/auth/google`}
          className="mt-8 flex w-full items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 hover:shadow dark:border-[#5f6368] dark:bg-[#3c4043] dark:text-[#e8eaed] dark:hover:bg-[#4a4d51]"
        >
          <GoogleIcon />
          Sign in with Google
        </a>
      </div>
    </div>
  );
}
