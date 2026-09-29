import { Link } from 'react-router-dom';
import AddToListSelect from './AddToListSelect';

export default function FileRow({ file, lists, onAddToList }) {
  return (
    <div className="group flex items-center gap-4 border-b border-grey-100 px-4 py-2.5 hover:bg-grey-50 dark:border-grey-800 dark:hover:bg-grey-850">
      <img src={file.iconLink} alt="" className="h-5 w-5 shrink-0" />
      <Link
        to={`/file/${file.id}`}
        className="min-w-0 flex-1 truncate text-sm text-grey-800 hover:underline dark:text-grey-200"
        title={file.name}
      >
        {file.name}
      </Link>

      <AddToListSelect file={file} lists={lists} onAddToList={onAddToList} />

      <span className="w-28 shrink-0 text-right text-xs text-grey-700 dark:text-grey-500">
        {new Date(file.modifiedTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
      </span>
    </div>
  );
}
