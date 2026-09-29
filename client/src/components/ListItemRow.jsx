import { Link } from 'react-router-dom';
import TagEditor from './TagEditor';

export default function ListItemRow({
  item,
  allTags,
  canEdit = true,
  canTag = true,
  onRemove,
  onAttachTag,
  onDetachTag,
  onCreateTag,
}) {
  return (
    <div className="flex flex-col gap-2 border-b border-grey-100 px-4 py-3 hover:bg-grey-50 dark:border-grey-800 dark:hover:bg-grey-850">
      <div className="flex items-center gap-4">
        <Link
          to={`/file/${item.driveFileId}`}
          className="min-w-0 flex-1 truncate text-sm text-grey-800 hover:underline dark:text-grey-200"
        >
          {item.fileName}
        </Link>
        {item.addedByLabel && (
          <span className="shrink-0 text-xs text-grey-700 dark:text-grey-500">
            added by {item.addedByLabel}
          </span>
        )}
        {canEdit && (
          <button
            onClick={() => onRemove(item.id)}
            className="shrink-0 text-xs font-medium text-grey-700 hover:text-danger dark:text-grey-500"
          >
            Remove
          </button>
        )}
      </div>
      {canTag && (
        <TagEditor
          item={item}
          allTags={allTags}
          canEdit={canEdit}
          onAttach={onAttachTag}
          onDetach={onDetachTag}
          onCreateTag={onCreateTag}
        />
      )}
    </div>
  );
}
