import { XIcon } from './icons';
import { useEscapeKey } from '../hooks/useEscapeKey';

export default function Modal({ open, onClose, header, children, maxWidth = 'max-w-lg' }) {
  useEscapeKey(open, onClose);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-30 flex items-start justify-center bg-black/40 pt-24" onClick={onClose}>
      <div
        className={`flex max-h-[70vh] w-full ${maxWidth} flex-col overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-[#292a2d]`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-[#e0e0e0] px-4 py-3 dark:border-[#3c4043]">
          {header}
          <button
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 rounded-full p-1 text-[#5f6368] hover:bg-[#f1f3f4] dark:text-[#9aa0a6] dark:hover:bg-[#3c4043]"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
