import { useState } from 'react';
import { TrashIcon, ShareIcon, PencilIcon } from './icons';
import TagEditModal from './TagEditModal';
import { isShared } from '../constants/visibility';

export default function SidebarTagRow({ tag, active, currentUserId, onSelectTag, onSaveTag, onDeleteTag }) {
  const [editing, setEditing] = useState(false);
  const canManage = tag.ownerId === currentUserId;

  return (
    <div
      className={`group relative flex items-center gap-4 rounded-r-full px-4 py-2 text-sm ${
        active
          ? 'bg-primary-soft font-medium text-primary dark:bg-grey-800'
          : 'text-grey-800 hover:bg-grey-100 dark:text-grey-200 dark:hover:bg-grey-850'
      }`}
    >
      <button
        type="button"
        onClick={() => canManage && setEditing(true)}
        aria-label={canManage ? `Edit ${tag.name}` : undefined}
        className={`block h-3.5 w-3.5 shrink-0 rounded-full ${active ? 'ring-2 ring-offset-1 ring-primary dark:ring-offset-grey-900' : ''}`}
        style={{ backgroundColor: tag.color }}
      />
      <button
        onClick={() => onSelectTag(tag.id)}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
        title={isShared(tag) ? `${tag.name} · shared` : tag.name}
      >
        <span className="min-w-0 flex-1 truncate">{tag.name}</span>
        {isShared(tag) && (
          <ShareIcon className="h-3 w-3 shrink-0 text-grey-700 dark:text-grey-500" />
        )}
      </button>
      {canManage && (
        <div className="absolute right-1 top-1/2 flex -translate-y-1/2 items-center rounded-full bg-inherit opacity-0 group-hover:opacity-100">
          <button
            onClick={() => setEditing(true)}
            aria-label={`Edit ${tag.name}`}
            className="rounded-full p-1.5 text-grey-500 hover:bg-grey-250 hover:text-primary dark:hover:bg-grey-700"
          >
            <PencilIcon className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onDeleteTag(tag.id)}
            aria-label={`Delete ${tag.name}`}
            className="rounded-full p-1.5 text-grey-500 hover:bg-grey-250 hover:text-danger dark:hover:bg-grey-700"
          >
            <TrashIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
      {canManage && (
        <TagEditModal open={editing} onClose={() => setEditing(false)} tag={tag} onSave={onSaveTag} />
      )}
    </div>
  );
}
