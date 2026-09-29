import { SearchIcon } from './icons';

export default function SidebarSearch({ value, onChange, placeholder }) {
  return (
    <div className="mb-1 flex items-center gap-2 rounded-full border border-grey-300 px-3 py-1 dark:border-grey-700">
      <SearchIcon className="h-3.5 w-3.5 shrink-0 text-grey-500" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-xs text-grey-900 placeholder:text-grey-500 focus:outline-none dark:text-grey-200"
      />
    </div>
  );
}
