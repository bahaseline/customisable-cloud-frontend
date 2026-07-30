import { Link } from 'react-router-dom';
import AddToListSelect from './AddToListSelect';

export default function FileRow({ file, lists, onAddToList }) {
  return (
    <div className="group flex items-center gap-4 border-b border-[#f1f3f4] px-4 py-2.5 hover:bg-[#f8f9fa] dark:border-[#3c4043] dark:hover:bg-[#292a2d]">
      <img src={file.iconLink} alt="" className="h-5 w-5 shrink-0" />
      <Link
        to={`/file/${file.id}`}
        className="min-w-0 flex-1 truncate text-sm text-[#3c4043] hover:underline dark:text-[#e8eaed]"
        title={file.name}
      >
        {file.name}
      </Link>

      <AddToListSelect file={file} lists={lists} onAddToList={onAddToList} />

      <span className="w-28 shrink-0 text-right text-xs text-[#5f6368] dark:text-[#9aa0a6]">
        {new Date(file.modifiedTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
      </span>
    </div>
  );
}
