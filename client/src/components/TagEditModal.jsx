import Modal from './Modal';
import ColorSwatchPicker from './ColorSwatchPicker';
import { TAG_COLORS } from '../constants/tagColors';
import { useTagEditModal } from '../hooks/useTagEditModal';

export default function TagEditModal({ open, onClose, tag, onSave }) {
  const { color, setColor, visibility, error, saving, handleSave, handleVisibilityChange } = useTagEditModal(
    tag,
    onSave,
    open
  );

  if (!tag) return null;

  const title = (
    <h2 className="min-w-0 flex-1 truncate text-base font-medium text-[#202124] dark:text-[#e8eaed]">
      Edit “{tag.name}”
    </h2>
  );

  async function handleSubmit(e) {
    e.preventDefault();
    const ok = await handleSave();
    if (ok) onClose();
  }

  return (
    <Modal open={open} onClose={onClose} header={title} maxWidth="max-w-sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-5 py-4">
        <div>
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-[#80868b] dark:text-[#9aa0a6]">
            Colour
          </p>
          <ColorSwatchPicker colors={TAG_COLORS} selectedColor={color} onPick={(_e, c) => setColor(c)} />
        </div>

        <div>
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-[#80868b] dark:text-[#9aa0a6]">
            Visible to
          </p>
          <div className="flex overflow-hidden rounded-full border border-[#dadce0] text-sm dark:border-[#5f6368]">
            <button
              type="button"
              disabled={saving}
              onClick={() => handleVisibilityChange('private')}
              className={`flex-1 px-3 py-1.5 text-center transition-colors disabled:opacity-50 ${
                visibility === 'private'
                  ? 'bg-[#1a73e8] text-white'
                  : 'text-[#5f6368] hover:bg-[#f1f3f4] dark:text-[#9aa0a6] dark:hover:bg-[#3c4043]'
              }`}
            >
              Only me
            </button>
            <button
              type="button"
              disabled={saving}
              title="Anyone who can see a file you've tagged with this can see and use the tag too"
              onClick={() => handleVisibilityChange('shared')}
              className={`flex-1 px-3 py-1.5 text-center transition-colors disabled:opacity-50 ${
                visibility === 'shared'
                  ? 'bg-[#1a73e8] text-white'
                  : 'text-[#5f6368] hover:bg-[#f1f3f4] dark:text-[#9aa0a6] dark:hover:bg-[#3c4043]'
              }`}
            >
              Everyone
            </button>
          </div>
          {visibility === 'shared' && (
            <p className="mt-1.5 text-[11px] leading-snug text-[#9aa0a6]">
              Becomes visible to others as soon as you add it to a file they can see.
            </p>
          )}
        </div>

        {error && <p className="text-xs text-[#d93025] dark:text-[#f28b82]">{error}</p>}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-4 py-1.5 text-sm font-medium text-[#5f6368] hover:bg-[#f1f3f4] dark:text-[#9aa0a6] dark:hover:bg-[#3c4043]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-[#1a73e8] px-4 py-1.5 text-sm font-medium text-white hover:bg-[#1765cc] disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
