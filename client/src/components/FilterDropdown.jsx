import { CheckIcon, ChevronDownIcon, FolderIcon } from './icons';
import { useFilterDropdown } from '../hooks/useFilterDropdown';

function Row({ item, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-grey-800 hover:bg-grey-100 dark:text-grey-200 dark:hover:bg-grey-800"
    >
      <span className="flex h-4 w-4 shrink-0 items-center justify-center text-primary dark:text-primary-light">
        {item.active && <CheckIcon className="h-4 w-4" />}
      </span>
      {item.type === 'tag' ? (
        <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
      ) : (
        <FolderIcon className="h-4 w-4 shrink-0 text-grey-700 dark:text-grey-500" />
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
        className="flex items-center gap-2 rounded-full border border-grey-300 bg-white px-3 py-1.5 text-sm text-grey-800 hover:bg-grey-100 dark:border-grey-700 dark:bg-grey-850 dark:text-grey-200 dark:hover:bg-grey-800"
      >
        <span>{buttonLabel}</span>
        <ChevronDownIcon className="h-4 w-4 shrink-0 text-grey-700 dark:text-grey-500" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-10 mt-1 max-h-96 w-64 overflow-y-auto rounded-lg border border-grey-300 bg-white py-1.5 shadow-lg dark:border-grey-700 dark:bg-grey-850">
          {groups.map((group, gi) => (
            <div key={group.title || gi}>
              {group.title && group.items.length > 0 && (
                <p className="mb-1 mt-3 px-3 text-xs font-medium uppercase tracking-wide text-grey-600 dark:text-grey-500">
                  {group.title}
                </p>
              )}
              {group.items.map((item) => (
                <Row key={item.key} item={item} onClick={() => select(item)} />
              ))}
            </div>
          ))}

          {groups.every((g) => g.items.length === 0) && (
            <p className="px-3 py-4 text-center text-xs text-grey-700 dark:text-grey-500">
              Nothing to filter by yet.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
