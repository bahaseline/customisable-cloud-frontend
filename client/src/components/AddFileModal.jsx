import { CheckIcon, SearchIcon } from './icons';
import Modal from './Modal';
import EmptyState from './EmptyState';
import { useAddFileModal } from '../hooks/useAddFileModal';

export default function AddFileModal({
  open,
  onClose,
  files,
  existingDriveFileIds,
  onAdd,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}) {
  const { query, setQuery, visibleFiles } = useAddFileModal(open, files);

  const searchField = (
    <>
      <SearchIcon className="h-5 w-5 shrink-0 text-grey-700 dark:text-grey-500" />
      <input
        id="add-file-search"
        name="fileSearch"
        autoComplete="off"
        autoFocus
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search your Drive files…"
        className="w-full bg-transparent text-sm text-grey-900 placeholder:text-grey-700 focus:outline-none dark:text-grey-200 dark:placeholder:text-grey-500"
      />
    </>
  );

  return (
    <Modal open={open} onClose={onClose} header={searchField}>
      <div className="flex-1 overflow-y-auto">
        {visibleFiles.length === 0 && <EmptyState message="No files match your search." className="py-10" />}
        {visibleFiles.map((file) => {
          const added = existingDriveFileIds.has(file.id);
          return (
            <button
              key={file.id}
              onClick={() => !added && onAdd(file)}
              disabled={added}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-grey-50 disabled:cursor-default dark:hover:bg-grey-800"
            >
              <img src={file.iconLink} alt="" className="h-5 w-5 shrink-0" />
              <span className="min-w-0 flex-1 truncate text-sm text-grey-800 dark:text-grey-200">
                {file.name}
              </span>
              {added && (
                <span className="flex shrink-0 items-center gap-1 text-xs text-success dark:text-success-light">
                  <CheckIcon className="h-3.5 w-3.5" />
                  Added
                </span>
              )}
            </button>
          );
        })}

        {hasNextPage && !query && (
          <div className="flex justify-center py-3">
            <button
              onClick={onLoadMore}
              disabled={isFetchingNextPage}
              className="rounded-full border border-grey-300 px-4 py-1.5 text-xs font-medium text-primary hover:bg-[#eaf1fb] disabled:opacity-50 dark:border-grey-700 dark:hover:bg-grey-800"
            >
              {isFetchingNextPage ? 'Loading…' : 'Load more files'}
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
