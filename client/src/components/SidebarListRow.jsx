import { FolderIcon, TrashIcon, ShareIcon, PencilIcon } from './icons';
import ListNameForm from './ListNameForm';
import { isOwner } from '../constants/roles';

export default function SidebarListRow({ list, active, editing, onSelect, onStartRenaming, onRename, onCancelRename, onShare, onDelete }) {
  if (editing) {
    return (
      <ListNameForm
        inputId={`rename-list-${list.id}`}
        initialValue={list.name}
        submitLabel="Save"
        onSubmit={(name) => onRename(list.id, name)}
        onCancel={onCancelRename}
      />
    );
  }

  return (
    <div
      className={`group relative flex items-center rounded-r-full ${
        active ? 'bg-primary-soft dark:bg-grey-800' : 'hover:bg-grey-100 dark:hover:bg-grey-850'
      }`}
    >
      <button
        onClick={() => onSelect(list.id)}
        className={`flex min-w-0 flex-1 items-center gap-3 px-4 py-2 text-left text-sm ${
          active ? 'font-medium text-primary' : 'text-grey-800 dark:text-grey-200'
        }`}
        title={list.name}
      >
        <FolderIcon className={`h-5 w-5 shrink-0 ${active ? 'text-primary' : 'text-grey-700 dark:text-grey-500'}`} />
        <span className="min-w-0 flex-1 truncate">{list.name}</span>
        {list.isShared && <ShareIcon className="h-3 w-3 shrink-0 text-grey-700 dark:text-grey-500" />}
      </button>
      {isOwner(list.role) && (
        <div className="absolute right-1 top-1/2 flex -translate-y-1/2 items-center rounded-full bg-inherit opacity-0 group-hover:opacity-100">
          <button
            onClick={() => onStartRenaming(list)}
            aria-label={`Rename ${list.name}`}
            className="rounded-full p-1.5 text-grey-500 hover:bg-grey-250 hover:text-primary dark:hover:bg-grey-700"
          >
            <PencilIcon className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onShare(list.id)}
            aria-label={`Share ${list.name}`}
            className="rounded-full p-1.5 text-grey-500 hover:bg-grey-250 hover:text-primary dark:hover:bg-grey-700"
          >
            <ShareIcon className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onDelete(list.id)}
            aria-label={`Delete ${list.name}`}
            className="rounded-full p-1.5 text-grey-500 hover:bg-grey-250 hover:text-danger dark:hover:bg-grey-700"
          >
            <TrashIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
