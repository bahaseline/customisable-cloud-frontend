import { useState } from 'react';
import { XIcon } from './icons';
import { TAG_COLORS } from './tagColors';

export default function TagEditor({ item, allTags, onAttach, onDetach, onCreateTag }) {
  const [adding, setAdding] = useState(false);
  const [query, setQuery] = useState('');
  const [color, setColor] = useState(TAG_COLORS[0]);

  const attachedIds = new Set(item.tags.map((t) => t.id));
  const suggestions = allTags.filter(
    (t) => !attachedIds.has(t.id) && t.name.toLowerCase().includes(query.toLowerCase())
  );
  const exactMatch = allTags.some((t) => t.name.toLowerCase() === query.trim().toLowerCase());

  async function handleSelect(tag) {
    await onAttach(item.id, tag);
    setQuery('');
    setAdding(false);
  }

  async function handleCreateAndAttach(e) {
    e.preventDefault();
    if (!query.trim()) return;
    const tag = await onCreateTag(query.trim(), color);
    await onAttach(item.id, tag);
    setQuery('');
    setColor(TAG_COLORS[0]);
    setAdding(false);
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {item.tags.map((tag) => (
        <span
          key={tag.id}
          style={{ backgroundColor: `${tag.color}22`, color: tag.color }}
          className="flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs"
        >
          {tag.name}
          <button
            onClick={() => onDetach(item.id, tag.id)}
            aria-label={`Remove tag ${tag.name}`}
            className="rounded-full hover:opacity-70"
          >
            <XIcon className="h-3 w-3" />
          </button>
        </span>
      ))}

      {adding ? (
        <form onSubmit={handleCreateAndAttach} className="relative">
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onBlur={() => setTimeout(() => setAdding(false), 150)}
            placeholder="Tag name…"
            className="w-28 rounded-full border border-[#dadce0] px-2.5 py-0.5 text-xs focus:border-[#1a73e8] focus:outline-none dark:border-[#5f6368] dark:bg-[#292a2d] dark:text-[#e8eaed]"
          />
          {query && (
            <ul className="absolute left-0 top-full z-10 mt-1 w-44 overflow-hidden rounded-lg border border-[#dadce0] bg-white text-xs shadow-lg dark:border-[#5f6368] dark:bg-[#292a2d]">
              {suggestions.map((tag) => (
                <li key={tag.id}>
                  <button
                    type="button"
                    onMouseDown={() => handleSelect(tag)}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[#3c4043] hover:bg-[#f1f3f4] dark:text-[#e8eaed] dark:hover:bg-[#3c4043]"
                  >
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="truncate">{tag.name}</span>
                  </button>
                </li>
              ))}
              {!exactMatch && (
                <li className="px-3 py-2">
                  <div className="mb-1.5 flex flex-wrap gap-1">
                    {TAG_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setColor(c);
                        }}
                        aria-label={`Use color ${c}`}
                        className={`h-4 w-4 rounded-full ${color === c ? 'ring-2 ring-offset-1 ring-[#3c4043] dark:ring-offset-[#292a2d]' : ''}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <button
                    type="submit"
                    className="block w-full text-left font-medium text-[#1a73e8] hover:underline"
                  >
                    Create "{query.trim()}"
                  </button>
                </li>
              )}
            </ul>
          )}
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
