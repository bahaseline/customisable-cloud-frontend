import { ListIcon, GridIcon } from './icons';

export default function ViewToggle({ view, onChange }) {
  return (
    <div className="flex items-center overflow-hidden rounded-full border border-[#dadce0] dark:border-[#5f6368]">
      <button
        onClick={() => onChange('list')}
        aria-label="List view"
        aria-pressed={view === 'list'}
        className={`flex h-8 w-9 items-center justify-center transition ${
          view === 'list'
            ? 'bg-[#e8f0fe] text-[#1a73e8] dark:bg-[#3c4043] dark:text-[#8ab4f8]'
            : 'text-[#5f6368] hover:bg-[#f1f3f4] dark:text-[#9aa0a6] dark:hover:bg-[#292a2d]'
        }`}
      >
        <ListIcon className="h-4 w-4" />
      </button>
      <button
        onClick={() => onChange('grid')}
        aria-label="Grid view"
        aria-pressed={view === 'grid'}
        className={`flex h-8 w-9 items-center justify-center border-l border-[#dadce0] transition dark:border-[#5f6368] ${
          view === 'grid'
            ? 'bg-[#e8f0fe] text-[#1a73e8] dark:bg-[#3c4043] dark:text-[#8ab4f8]'
            : 'text-[#5f6368] hover:bg-[#f1f3f4] dark:text-[#9aa0a6] dark:hover:bg-[#292a2d]'
        }`}
      >
        <GridIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
