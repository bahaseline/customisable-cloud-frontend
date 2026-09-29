import Modal from './Modal';

// Dismissing the dialog any way at all (clicking outside, pressing escape, clicking cancel) will call onCancel.
export default function ConfirmDialog({ request, onConfirm, onCancel }) {
  const title = (
    <h2 className="min-w-0 flex-1 text-base font-medium text-grey-900 dark:text-grey-200">
      {request?.title}
    </h2>
  );

  return (
    <Modal open={!!request} onClose={onCancel} header={title} maxWidth="max-w-sm">
      <div className="px-5 py-4">
        <p className="text-sm text-grey-700 dark:text-grey-500">{request?.message}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-full px-4 py-1.5 text-sm font-medium text-grey-700 hover:bg-grey-100 dark:text-grey-500 dark:hover:bg-grey-800"
          >
            {request?.cancelLabel || 'Cancel'}
          </button>
          <button
            autoFocus
            onClick={onConfirm}
            className={`rounded-full px-4 py-1.5 text-sm font-medium text-white ${
              request?.destructive
                ? 'bg-danger hover:bg-[#b3261e]'
                : 'bg-primary hover:bg-primary-hover'
            }`}
          >
            {request?.confirmLabel || 'Confirm'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
