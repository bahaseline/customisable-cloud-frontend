import { CheckIcon, ChevronDownIcon, FolderIcon } from './icons';
import { useFilterDropdown } from '../hooks/useFilterDropdown';

function Row({ item, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-[#3c4043] hover:bg-[#f1f3f4] dark:text-[#e8eaed] dark:hover:bg-[#3c4043]"
    >
      <span className="flex h-4 w-4 shrink-0 items-center justify-center text-[#1a73e8] dark:text-[#8ab4f8]">
        {item.active && <CheckIcon className="h-4 w-4" />}
      </span>
      {item.type === 'label' ? (
        <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
      ) : (
        <FolderIcon className="h-4 w-4 shrink-0 text-[#5f6368] dark:text-[#9aa0a6]" />
      )}
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
    </button>
  );
}

export default function FilterDropdown({ buttonLabel, groups }) {
  const { open, containerRef, toggle, select } = useFilterDropdown();

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={toggle}
        className="flex items-center gap-2 rounded-full border border-[#dadce0] bg-white px-3 py-1.5 text-sm text-[#3c4043] hover:bg-[#f1f3f4] dark:border-[#5f6368] dark:bg-[#292a2d] dark:text-[#e8eaed] dark:hover:bg-[#3c4043]"
      >
        <span>{buttonLabel}</span>
        <ChevronDownIcon className="h-4 w-4 shrink-0 text-[#5f6368] dark:text-[#9aa0a6]" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-10 mt-1 max-h-96 w-64 overflow-y-auto rounded-lg border border-[#dadce0] bg-white py-1.5 shadow-lg dark:border-[#5f6368] dark:bg-[#292a2d]">
          {groups.map((group, gi) => (
            <div key={group.title || gi}>
              {group.title && group.items.length > 0 && (
                <p className="mb-1 mt-3 px-3 text-xs font-medium uppercase tracking-wide text-[#80868b] dark:text-[#9aa0a6]">
                  {group.title}
                </p>
              )}
              {group.items.map((item) => (
                <Row key={item.key} item={item} onClick={() => select(item)} />
              ))}
            </div>
          ))}

          {groups.every((g) => g.items.length === 0) && (
            <p className="px-3 py-4 text-center text-xs text-[#5f6368] dark:text-[#9aa0a6]">
              Nothing to filter by yet.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
