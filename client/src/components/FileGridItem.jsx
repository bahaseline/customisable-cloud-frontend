import { Link } from 'react-router-dom';
import AddToListSelect from './AddToListSelect';

export default function FileGridItem({ file, lists, onAddToList }) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-[#dadce0] bg-white transition hover:shadow-md dark:border-[#3c4043] dark:bg-[#292a2d]">
      <Link
        to={`/file/${file.id}`}
        className="flex h-24 items-center justify-center bg-[#f8f9fa] dark:bg-[#202124]"
        aria-label={file.name}
      >
        <img src={file.iconLink} alt="" className="h-9 w-9" />
      </Link>
      <div className="flex items-center gap-2 border-t border-[#dadce0] px-3 py-2.5 dark:border-[#3c4043]">
        <Link
          to={`/file/${file.id}`}
          className="min-w-0 flex-1 truncate text-sm text-[#3c4043] hover:underline dark:text-[#e8eaed]"
          title={file.name}
        >
          {file.name}
        </Link>
        <AddToListSelect file={file} lists={lists} onAddToList={onAddToList} size="sm" />
      </div>
    </div>
  );
}
