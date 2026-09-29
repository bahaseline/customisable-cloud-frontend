import { ListIcon, GridIcon } from './icons';

export default function ViewToggle({ view, onChange }) {
  return (
    <div className="flex items-center overflow-hidden rounded-full border border-grey-300 dark:border-grey-700">
      <button
        onClick={() => onChange('list')}
        aria-label="List view"
        aria-pressed={view === 'list'}
        className={`flex h-8 w-9 items-center justify-center transition ${
          view === 'list'
            ? 'bg-primary-soft text-primary dark:bg-grey-800 dark:text-primary-light'
            : 'text-grey-700 hover:bg-grey-100 dark:text-grey-500 dark:hover:bg-grey-850'
        }`}
      >
        <ListIcon className="h-4 w-4" />
      </button>
      <button
        onClick={() => onChange('grid')}
        aria-label="Grid view"
        aria-pressed={view === 'grid'}
        className={`flex h-8 w-9 items-center justify-center border-l border-grey-300 transition dark:border-grey-700 ${
          view === 'grid'
            ? 'bg-primary-soft text-primary dark:bg-grey-800 dark:text-primary-light'
            : 'text-grey-700 hover:bg-grey-100 dark:text-grey-500 dark:hover:bg-grey-850'
        }`}
      >
        <GridIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
