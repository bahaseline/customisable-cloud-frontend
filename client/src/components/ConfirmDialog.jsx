import Modal from './Modal';

// Dismissing the dialog any way at all (clicking outside, pressing escape, clicking cancel) will call onCancel.
export default function ConfirmDialog({ request, onConfirm, onCancel }) {
  const title = (
    <h2 className="min-w-0 flex-1 text-base font-medium text-[#202124] dark:text-[#e8eaed]">
      {request?.title}
    </h2>
  );

  return (
    <Modal open={!!request} onClose={onCancel} header={title} maxWidth="max-w-sm">
      <div className="px-5 py-4">
        <p className="text-sm text-[#5f6368] dark:text-[#9aa0a6]">{request?.message}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-full px-4 py-1.5 text-sm font-medium text-[#5f6368] hover:bg-[#f1f3f4] dark:text-[#9aa0a6] dark:hover:bg-[#3c4043]"
          >
            {request?.cancelLabel || 'Cancel'}
          </button>
          <button
            autoFocus
            onClick={onConfirm}
            className={`rounded-full px-4 py-1.5 text-sm font-medium text-white ${
              request?.destructive
                ? 'bg-[#d93025] hover:bg-[#b3261e]'
                : 'bg-[#1a73e8] hover:bg-[#1765cc]'
            }`}
          >
            {request?.confirmLabel || 'Confirm'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
