import { Link } from 'react-router-dom';
import TagEditor from './TagEditor';

export default function ListItemRow({
  item,
  allTags,
  canEdit = true,
  canLabel = true,
  onRemove,
  onAttachTag,
  onDetachTag,
  onCreateTag,
}) {
  return (
    <div className="flex flex-col gap-2 border-b border-[#f1f3f4] px-4 py-3 hover:bg-[#f8f9fa] dark:border-[#3c4043] dark:hover:bg-[#292a2d]">
      <div className="flex items-center gap-4">
        <Link
          to={`/file/${item.driveFileId}`}
          className="min-w-0 flex-1 truncate text-sm text-[#3c4043] hover:underline dark:text-[#e8eaed]"
        >
          {item.fileName}
        </Link>
        {canEdit && (
          <button
            onClick={() => onRemove(item.id)}
            className="shrink-0 text-xs font-medium text-[#5f6368] hover:text-[#d93025] dark:text-[#9aa0a6]"
          >
            Remove
          </button>
        )}
      </div>
      {canLabel && (
        <TagEditor
          item={item}
          allTags={allTags}
          onAttach={onAttachTag}
          onDetach={onDetachTag}
          onCreateTag={onCreateTag}
        />
      )}
    </div>
  );
}
