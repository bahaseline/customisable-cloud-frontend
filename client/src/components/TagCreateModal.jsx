import { useId } from 'react';
import Modal from './Modal';
import ColorSwatchPicker from './ColorSwatchPicker';
import { TAG_COLORS } from '../constants/tagColors';
import { useTagCreateModal } from '../hooks/useTagCreateModal';
import VisibilityToggle from './VisibilityToggle';
import { VISIBILITY } from '../constants/visibility';

export default function TagCreateModal({ open, onClose, onCreate }) {
  const { name, setName, color, setColor, visibility, setVisibility, error, saving, handleCreate } =
    useTagCreateModal(onCreate, open);
  const inputId = useId();

  const title = (
    <h2 className="min-w-0 flex-1 truncate text-base font-medium text-grey-900 dark:text-grey-200">
      New tag
    </h2>
  );

  async function handleSubmit(e) {
    e.preventDefault();
    const ok = await handleCreate();
    if (ok) onClose();
  }

  return (
    <Modal open={open} onClose={onClose} header={title} maxWidth="max-w-sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-5 py-4">
        <div>
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-grey-600 dark:text-grey-500"
          >
            Name
          </label>
          <input
            id={inputId}
            name="tagName"
            autoComplete="off"
            autoFocus
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Urgent"
            className="w-full rounded-lg border border-grey-300 px-3 py-2 text-sm focus:border-primary focus:outline-none dark:border-grey-700 dark:bg-grey-900 dark:text-grey-200"
          />
        </div>

        <div>
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-grey-600 dark:text-grey-500">
            Colour
          </p>
          <ColorSwatchPicker colors={TAG_COLORS} selectedColor={color} onPick={(_e, c) => setColor(c)} />
        </div>

        <div>
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-grey-600 dark:text-grey-500">
            Visible to
          </p>
          <VisibilityToggle value={visibility} onChange={setVisibility} />
          {visibility === VISIBILITY.SHARED && (
            <p className="mt-1.5 text-[11px] leading-snug text-grey-500">
              Becomes visible to others as soon as you add it to a file they can see.
            </p>
          )}
        </div>

        {error && <p className="text-xs text-danger dark:text-danger-light">{error}</p>}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-4 py-1.5 text-sm font-medium text-grey-700 hover:bg-grey-100 dark:text-grey-500 dark:hover:bg-grey-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50"
          >
            {saving ? 'Creating…' : 'Create'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
