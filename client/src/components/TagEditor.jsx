import { useId } from 'react';
import { TAG_COLORS } from '../constants/tagColors';
import ColorSwatchPicker from './ColorSwatchPicker';
import TagChip from './TagChip';
import { useTagEditor } from '../hooks/useTagEditor';

export default function TagEditor({ item, allTags, onAttach, onDetach, onCreateTag }) {
  const {
    adding,
    setAdding,
    query,
    setQuery,
    color,
    highlight,
    setHighlight,
    suggestions,
    canCreate,
    handleSelect,
    handleCreateAndAttach,
    handleKeyDown,
    handlePickColor,
    handleBlur,
  } = useTagEditor(item, allTags, onAttach, onCreateTag);

  // One editor per list item, so the id cannot be a constant.
  const inputId = useId();

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {item.tags.map((tag) => (
        <TagChip key={tag.id} tag={tag} onRemove={() => onDetach(item.id, tag.id)} />
      ))}

      {adding ? (
        <form onSubmit={handleCreateAndAttach} className="relative">
          <input
            id={inputId}
            name="tagName"
            autoComplete="off"
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            placeholder="Search or create a label…"
            className="w-52 rounded-full border border-[#dadce0] px-3 py-1 text-xs focus:border-[#1a73e8] focus:outline-none dark:border-[#5f6368] dark:bg-[#292a2d] dark:text-[#e8eaed]"
          />

          <div className="absolute left-0 top-full z-10 mt-1 w-52 overflow-hidden rounded-lg border border-[#dadce0] bg-white text-xs shadow-lg dark:border-[#5f6368] dark:bg-[#292a2d]">
            {suggestions.length > 0 && (
              <ul className="max-h-44 overflow-y-auto py-1">
                {suggestions.map((tag, i) => (
                  <li key={tag.id}>
                    <button
                      type="button"
                      onMouseDown={() => handleSelect(tag)}
                      onMouseEnter={() => setHighlight(i)}
                      className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-[#3c4043] dark:text-[#e8eaed] ${
                        highlight === i ? 'bg-[#f1f3f4] dark:bg-[#3c4043]' : ''
                      }`}
                    >
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span className="truncate">{tag.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {suggestions.length === 0 && !canCreate && (
              <p className="px-3 py-2.5 text-center text-[#5f6368] dark:text-[#9aa0a6]">
                All your labels are already on this file.
              </p>
            )}

            {canCreate && (
              <div className={`px-3 py-2 ${suggestions.length > 0 ? 'border-t border-[#e0e0e0] dark:border-[#3c4043]' : ''}`}>
                <p className="mb-1.5 text-[#5f6368] dark:text-[#9aa0a6]">Pick a colour</p>
                <div className="mb-2">
                  <ColorSwatchPicker colors={TAG_COLORS} selectedColor={color} onPick={handlePickColor} />
                </div>
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-1.5 rounded-full bg-[#1a73e8] px-3 py-2 text-xs font-medium text-white hover:bg-[#1765cc]"
                >
                  <span className="text-sm leading-none">+</span>
                  Create “{query.trim()}”
                </button>
              </div>
            )}
          </div>
        </form>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="rounded-full border border-dashed border-[#dadce0] px-2.5 py-0.5 text-xs text-[#5f6368] hover:bg-[#f1f3f4] dark:border-[#5f6368] dark:text-[#9aa0a6] dark:hover:bg-[#3c4043]"
        >
          + tag
        </button>
      )}
    </div>
  );
}
