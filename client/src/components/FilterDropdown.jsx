import { CheckIcon, ChevronDownIcon, FolderIcon } from './icons';
import { useFilterDropdown } from '../hooks/useFilterDropdown';

function Row({ icon: Icon, dotColor, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-[#3c4043] hover:bg-[#f1f3f4] dark:text-[#e8eaed] dark:hover:bg-[#3c4043]"
    >
      <span className="flex h-4 w-4 shrink-0 items-center justify-center text-[#1a73e8] dark:text-[#8ab4f8]">
        {active && <CheckIcon className="h-4 w-4" />}
      </span>
      {dotColor ? (
        <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: dotColor }} />
      ) : (
        <Icon className="h-4 w-4 shrink-0 text-[#5f6368] dark:text-[#9aa0a6]" />
      )}
      <span className="min-w-0 flex-1 truncate">{label}</span>
    </button>
  );
}

export default function FilterDropdown({ lists, activeListId, onSelectList, tags, activeTagId, onSelectTag }) {
  const { open, containerRef, toggle, selectList, selectTag } = useFilterDropdown(onSelectList, onSelectTag);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={toggle}
        className="flex items-center gap-2 rounded-full border border-[#dadce0] bg-white px-3 py-1.5 text-sm text-[#3c4043] hover:bg-[#f1f3f4] dark:border-[#5f6368] dark:bg-[#292a2d] dark:text-[#e8eaed] dark:hover:bg-[#3c4043]"
      >
        <span>Browse lists &amp; labels</span>
        <ChevronDownIcon className="h-4 w-4 shrink-0 text-[#5f6368] dark:text-[#9aa0a6]" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-10 mt-1 max-h-96 w-64 overflow-y-auto rounded-lg border border-[#dadce0] bg-white py-1.5 shadow-lg dark:border-[#5f6368] dark:bg-[#292a2d]">
          <Row
            icon={FolderIcon}
            label="All Drive Files"
            active={!activeListId && !activeTagId}
            onClick={() => selectList(null)}
          />

          {lists.length > 0 && (
            <p className="mb-1 mt-3 px-3 text-xs font-medium uppercase tracking-wide text-[#80868b] dark:text-[#9aa0a6]">
              Lists
            </p>
          )}
          {lists.map((list) => (
            <Row
              key={list.id}
              icon={FolderIcon}
              label={list.name}
              active={activeListId === list.id}
              onClick={() => selectList(list.id)}
            />
          ))}

          {tags.length > 0 && (
            <p className="mb-1 mt-3 px-3 text-xs font-medium uppercase tracking-wide text-[#80868b] dark:text-[#9aa0a6]">
              Labels
            </p>
          )}
          {tags.map((tag) => (
            <Row
              key={tag.id}
              dotColor={tag.color}
              label={tag.name}
              active={activeTagId === tag.id}
              onClick={() => selectTag(tag.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
