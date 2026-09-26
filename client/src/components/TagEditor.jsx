import { useId } from 'react';
import { TAG_COLORS } from '../constants/tagColors';
import ColorSwatchPicker from './ColorSwatchPicker';
import TagChip from './TagChip';
import { ShareIcon } from './icons';
import { useTagEditor } from '../hooks/useTagEditor';

export default function TagEditor({ item, allTags, canEdit = true, onAttach, onDetach, onCreateTag }) {
  const attachableTags = canEdit ? allTags : allTags.filter((t) => t.visibility !== 'shared');

  const {
    adding,
    setAdding,
    query,
    setQuery,
    color,
    visibility,
    setVisibility,
    highlight,
    setHighlight,
    suggestions,
    canCreate,
    handleSelect,
    handleCreateAndAttach,
    handleKeyDown,
    handlePickColor,
    handleBlur,
  } = useTagEditor(item, attachableTags, onAttach, onCreateTag);

  // One editor per list item, so the id cannot be a constant.
  const inputId = useId();

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {item.tags.map((tag) => (
        <TagChip
          key={tag.id}
          tag={tag}
          onRemove={canEdit || tag.visibility !== 'shared' ? () => onDetach(item.id, tag.id) : undefined}
        />
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
            placeholder="Search or create a tag…"
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
                      {tag.visibility === 'shared' && (
                        <span title="Shared — visible to anyone who can see a file it's on" className="ml-auto flex shrink-0">
                          <ShareIcon className="h-3 w-3 text-[#5f6368] dark:text-[#9aa0a6]" />
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {suggestions.length === 0 && !canCreate && (
              <p className="px-3 py-2.5 text-center text-[#5f6368] dark:text-[#9aa0a6]">
                All your tags are already on this file.
              </p>
            )}

            {canCreate && (
              <div className={`px-3 py-2 ${suggestions.length > 0 ? 'border-t border-[#e0e0e0] dark:border-[#3c4043]' : ''}`}>
                <p className="mb-1.5 text-[#5f6368] dark:text-[#9aa0a6]">Pick a colour</p>
                <div className="mb-2">
                  <ColorSwatchPicker colors={TAG_COLORS} selectedColor={color} onPick={handlePickColor} />
                </div>

                <div className="mb-2">
                  <p className="mb-1.5 text-[#5f6368] dark:text-[#9aa0a6]">Visible to</p>
                  <div className="flex overflow-hidden rounded-full border border-[#dadce0] dark:border-[#5f6368]">
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setVisibility('private');
                      }}
                      className={`flex-1 px-2.5 py-1 text-center transition-colors ${
                        visibility === 'private'
                          ? 'bg-[#1a73e8] text-white'
                          : 'text-[#5f6368] hover:bg-[#f1f3f4] dark:text-[#9aa0a6] dark:hover:bg-[#3c4043]'
                      }`}
                    >
                      Only me
                    </button>
                    <button
                      type="button"
                      disabled={!canEdit}
                      title={
                        canEdit
                          ? "Anyone who can see a file you've tagged with this can see and use the tag too"
                          : 'Requires editor access on this list'
                      }
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setVisibility('shared');
                      }}
                      className={`flex flex-1 items-center justify-center gap-1 px-2.5 py-1 text-center transition-colors ${
                        !canEdit
                          ? 'cursor-not-allowed text-[#c7cacd] dark:text-[#5f6368]'
                          : visibility === 'shared'
                            ? 'bg-[#1a73e8] text-white'
                            : 'text-[#5f6368] hover:bg-[#f1f3f4] dark:text-[#9aa0a6] dark:hover:bg-[#3c4043]'
                      }`}
                    >
                      <ShareIcon className="h-3 w-3 shrink-0" />
                      Everyone
                    </button>
                  </div>
                  {!canEdit && (
                    <p className="mt-1 text-[10px] leading-snug text-[#9aa0a6]">
                      You need editor access on this list to attach a shared tag.
                    </p>
                  )}
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
