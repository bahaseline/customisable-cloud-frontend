import { Link } from 'react-router-dom';

export default function TagItemRow({ item, parentListName }) {
  return (
    <Link
      to={`/file/${item.driveFileId}`}
      className="flex items-center gap-4 border-b border-[#f1f3f4] px-4 py-2.5 hover:bg-[#f8f9fa] dark:border-[#3c4043] dark:hover:bg-[#292a2d]"
    >
      <span className="min-w-0 flex-1 truncate text-sm text-[#3c4043] dark:text-[#e8eaed]">
        {item.fileName}
      </span>
      {parentListName && (
        <span className="shrink-0 text-xs text-[#5f6368] dark:text-[#9aa0a6]">{parentListName}</span>
      )}
    </Link>
  );
}
