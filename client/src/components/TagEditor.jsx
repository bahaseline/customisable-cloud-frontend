import { useId } from 'react';
import { TAG_COLORS } from '../constants/tagColors';
import ColorSwatchPicker from './ColorSwatchPicker';
import TagChip from './TagChip';
import { ShareIcon } from './icons';
import { useTagEditor } from '../hooks/useTagEditor';
import VisibilityToggle from './VisibilityToggle';
import { isShared } from '../constants/visibility';

export default function TagEditor({ item, allTags, canEdit = true, onAttach, onDetach, onCreateTag }) {
  // Without edit rights only personal (private) tags can be attached or removed.
  const canChangeTag = (tag) => canEdit || !isShared(tag);
  const attachableTags = allTags.filter(canChangeTag);

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
          onRemove={canChangeTag(tag) ? () => onDetach(item.id, tag.id) : undefined}
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
            className="w-52 rounded-full border border-grey-300 px-3 py-1 text-xs focus:border-primary focus:outline-none dark:border-grey-700 dark:bg-grey-850 dark:text-grey-200"
          />

          <div className="absolute left-0 top-full z-10 mt-1 w-52 overflow-hidden rounded-lg border border-grey-300 bg-white text-xs shadow-lg dark:border-grey-700 dark:bg-grey-850">
            {suggestions.length > 0 && (
              <ul className="max-h-44 overflow-y-auto py-1">
                {suggestions.map((tag, i) => (
                  <li key={tag.id}>
                    <button
                      type="button"
                      onMouseDown={() => handleSelect(tag)}
                      onMouseEnter={() => setHighlight(i)}
                      className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-grey-800 dark:text-grey-200 ${
                        highlight === i ? 'bg-grey-100 dark:bg-grey-800' : ''
                      }`}
                    >
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span className="truncate">{tag.name}</span>
                      {isShared(tag) && (
                        <span title="Shared — visible to anyone who can see a file it's on" className="ml-auto flex shrink-0">
                          <ShareIcon className="h-3 w-3 text-grey-700 dark:text-grey-500" />
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {suggestions.length === 0 && !canCreate && (
              <p className="px-3 py-2.5 text-center text-grey-700 dark:text-grey-500">
                All your tags are already on this file.
              </p>
            )}

            {canCreate && (
              <div className={`px-3 py-2 ${suggestions.length > 0 ? 'border-t border-grey-250 dark:border-grey-800' : ''}`}>
                <p className="mb-1.5 text-grey-700 dark:text-grey-500">Pick a colour</p>
                <div className="mb-2">
                  <ColorSwatchPicker colors={TAG_COLORS} selectedColor={color} onPick={handlePickColor} />
                </div>

                <div className="mb-2">
                  <p className="mb-1.5 text-grey-700 dark:text-grey-500">Visible to</p>
                  <VisibilityToggle
                    compact
                    value={visibility}
                    onChange={setVisibility}
                    sharedDisabledReason={canEdit ? undefined : 'Requires editor access on this list'}
                  />
                  {!canEdit && (
                    <p className="mt-1 text-[10px] leading-snug text-grey-500">
                      You need editor access on this list to attach a shared tag.
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-1.5 rounded-full bg-primary px-3 py-2 text-xs font-medium text-white hover:bg-primary-hover"
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
          className="rounded-full border border-dashed border-grey-300 px-2.5 py-0.5 text-xs text-grey-700 hover:bg-grey-100 dark:border-grey-700 dark:text-grey-500 dark:hover:bg-grey-800"
        >
          + tag
        </button>
      )}
    </div>
  );
}
