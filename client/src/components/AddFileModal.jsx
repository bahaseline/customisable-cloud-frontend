import { useEffect, useMemo, useState } from 'react';
import { CheckIcon, SearchIcon, XIcon } from './icons';

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
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    if (open) document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  const visibleFiles = useMemo(
    () => files.filter((f) => f.name.toLowerCase().includes(query.toLowerCase())),
    [files, query]
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-30 flex items-start justify-center bg-black/40 pt-24" onClick={onClose}>
      <div
        className="flex max-h-[70vh] w-full max-w-lg flex-col overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-[#292a2d]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-[#e0e0e0] px-4 py-3 dark:border-[#3c4043]">
          <SearchIcon className="h-5 w-5 shrink-0 text-[#5f6368] dark:text-[#9aa0a6]" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your Drive files…"
            className="w-full bg-transparent text-sm text-[#202124] placeholder:text-[#5f6368] focus:outline-none dark:text-[#e8eaed] dark:placeholder:text-[#9aa0a6]"
          />
          <button
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 rounded-full p-1 text-[#5f6368] hover:bg-[#f1f3f4] dark:text-[#9aa0a6] dark:hover:bg-[#3c4043]"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {visibleFiles.length === 0 && (
            <p className="py-10 text-center text-sm text-[#5f6368] dark:text-[#9aa0a6]">No files match your search.</p>
          )}
          {visibleFiles.map((file) => {
            const added = existingDriveFileIds.has(file.id);
            return (
              <button
                key={file.id}
                onClick={() => !added && onAdd(file)}
                disabled={added}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-[#f8f9fa] disabled:cursor-default dark:hover:bg-[#3c4043]"
              >
                <img src={file.iconLink} alt="" className="h-5 w-5 shrink-0" />
                <span className="min-w-0 flex-1 truncate text-sm text-[#3c4043] dark:text-[#e8eaed]">
                  {file.name}
                </span>
                {added && (
                  <span className="flex shrink-0 items-center gap-1 text-xs text-[#188038] dark:text-[#81c995]">
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
                className="rounded-full border border-[#dadce0] px-4 py-1.5 text-xs font-medium text-[#1a73e8] hover:bg-[#eaf1fb] disabled:opacity-50 dark:border-[#5f6368] dark:hover:bg-[#3c4043]"
              >
                {isFetchingNextPage ? 'Loading…' : 'Load more files'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
