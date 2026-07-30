import { Link } from 'react-router-dom';
import AddToListSelect from './AddToListSelect';

export default function FileGridItem({ file, lists, onAddToList }) {
  return (
    <Link
      to={`/file/${file.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-[#dadce0] bg-white transition hover:shadow-md dark:border-[#3c4043] dark:bg-[#292a2d]"
    >
      <div className="flex h-24 items-center justify-center bg-[#f8f9fa] dark:bg-[#202124]">
        <img src={file.iconLink} alt="" className="h-9 w-9" />
      </div>
      <div className="flex items-center gap-2 border-t border-[#dadce0] px-3 py-2.5 dark:border-[#3c4043]">
        <span className="min-w-0 flex-1 truncate text-sm text-[#3c4043] dark:text-[#e8eaed]" title={file.name}>
          {file.name}
        </span>
        <div onClick={(e) => e.preventDefault()}>
          <AddToListSelect file={file} lists={lists} onAddToList={onAddToList} size="sm" />
        </div>
      </div>
    </Link>
  );
}
