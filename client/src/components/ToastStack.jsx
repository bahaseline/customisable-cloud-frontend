import { XIcon } from './icons';

const TONES = {
  error: 'border-l-4 border-[#d93025] dark:border-[#f28b82]',
  success: 'border-l-4 border-[#188038] dark:border-[#81c995]',
};

export default function ToastStack({ toasts, onDismiss }) {
  if (toasts.length === 0) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-0 z-50 flex flex-col items-center justify-center gap-2 px-4"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg bg-[#202124] px-4 py-3 shadow-2xl dark:bg-[#3c4043] ${TONES[toast.tone] || ''}`}
        >
          <p className="min-w-0 flex-1 text-sm text-white">{toast.message}</p>
          <button
            onClick={() => onDismiss(toast.id)}
            aria-label="Dismiss"
            className="shrink-0 rounded-full p-0.5 text-[#9aa0a6] hover:bg-white/10 hover:text-white"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
