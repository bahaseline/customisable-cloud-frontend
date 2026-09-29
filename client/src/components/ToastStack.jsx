import { CheckIcon, XIcon } from './icons';

const TONES = {
  success: {
    icon: 'bg-[#e6f4ea] text-[#188038] dark:bg-[#25352b] dark:text-[#81c995]',
    Icon: CheckIcon,
  },
};

export default function ToastStack({ toasts, onDismiss }) {
  if (toasts.length === 0) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex flex-col items-center gap-2 px-4"
    >
      {toasts.map((toast) => {
        const tone = TONES[toast.tone];
        const Icon = tone?.Icon;
        return (
          <div
            key={toast.id}
            className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-lg ring-1 ring-black/5 dark:bg-[#3c4043] dark:ring-white/10"
          >
            {Icon && (
              <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${tone.icon}`}>
                <Icon className="h-3.5 w-3.5" />
              </span>
            )}
            <p className="min-w-0 flex-1 text-sm text-[#202124] dark:text-[#e8eaed]">{toast.message}</p>
            <button
              onClick={() => onDismiss(toast.id)}
              aria-label="Dismiss"
              className="shrink-0 rounded-full p-1 text-[#9aa0a6] hover:bg-black/5 hover:text-[#3c4043] dark:hover:bg-white/10 dark:hover:text-white"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
