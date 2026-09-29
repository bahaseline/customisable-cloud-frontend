import { XIcon } from './icons';
import { useEscapeKey } from '../hooks/useEscapeKey';

export default function Modal({ open, onClose, header, children, maxWidth = 'max-w-lg' }) {
  useEscapeKey(open, onClose);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className={`flex max-h-[70vh] w-full ${maxWidth} flex-col overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-grey-850`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-grey-250 px-4 py-3 dark:border-grey-800">
          {header}
          <button
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 rounded-full p-1 text-grey-700 hover:bg-grey-100 dark:text-grey-500 dark:hover:bg-grey-800"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
