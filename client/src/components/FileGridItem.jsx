import { Link } from 'react-router-dom';
import AddToListSelect from './AddToListSelect';

export default function FileGridItem({ file, lists, onAddToList }) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-grey-300 bg-white transition hover:shadow-md dark:border-grey-800 dark:bg-grey-850">
      <Link
        to={`/file/${file.id}`}
        className="flex h-24 items-center justify-center bg-grey-50 dark:bg-grey-900"
        aria-label={file.name}
      >
        <img src={file.iconLink} alt="" className="h-9 w-9" />
      </Link>
      <div className="flex items-center gap-2 border-t border-grey-300 px-3 py-2.5 dark:border-grey-800">
        <Link
          to={`/file/${file.id}`}
          className="min-w-0 flex-1 truncate text-sm text-grey-800 hover:underline dark:text-grey-200"
          title={file.name}
        >
          {file.name}
        </Link>
        <AddToListSelect file={file} lists={lists} onAddToList={onAddToList} size="sm" />
      </div>
    </div>
  );
}
