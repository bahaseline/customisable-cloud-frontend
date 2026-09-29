import { useId } from 'react';
import { FolderPlusIcon } from './icons';

export default function AddToListSelect({ file, lists, onAddToList, size = 'md' }) {
  const selectId = useId();

  if (lists.length === 0) return null;

  const dimensions = size === 'sm' ? 'w-6 py-1' : 'w-8 py-1.5';
  const iconSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';

  return (
    <div className="relative shrink-0 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
      <select
        id={selectId}
        name="addToList"
        aria-label={`Add ${file.name} to a list`}
        className={`peer cursor-pointer appearance-none rounded-full text-transparent hover:bg-grey-200 focus:outline-none dark:hover:bg-grey-800 ${dimensions}`}
        defaultValue=""
        onChange={(e) => {
          if (e.target.value) {
            onAddToList(e.target.value, file);
            e.target.value = '';
          }
        }}
      >
        <option value="" disabled>
          Add to list
        </option>
        {lists.map((list) => (
          <option key={list.id} value={list.id}>
            {list.name}
          </option>
        ))}
      </select>
      <FolderPlusIcon
        className={`pointer-events-none absolute inset-0 m-auto text-grey-700 dark:text-grey-500 ${iconSize}`}
      />
    </div>
  );
}
