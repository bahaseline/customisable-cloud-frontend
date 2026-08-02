import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  useFiles,
  useLists,
  useListDetail,
  useTags,
  useTagItems,
  useCreateList,
  useDeleteList,
  useAddToList,
  useRemoveFromList,
  useCreateTag,
  useAttachTag,
  useDetachTag,
} from '../hooks/queries';
import TopBar from '../components/TopBar';
import ListsSidebar from '../components/ListsSidebar';
import FileRow from '../components/FileRow';
import FileGridItem from '../components/FileGridItem';
import ViewToggle from '../components/ViewToggle';
import ListItemRow from '../components/ListItemRow';
import Spinner from '../components/Spinner';
import FilterDropdown from '../components/FilterDropdown';

export default function FilesPage() {
  const { user, logout } = useAuth();

  const [activeListId, setActiveListId] = useState(null);
  const [activeTagId, setActiveTagId] = useState(null);
  const [search, setSearch] = useState('');
  const [view, setView] = useState(() => localStorage.getItem('fileView') || 'list');

  const { files, hasNextPage, isFetchingNextPage, fetchNextPage, isLoading: filesLoading, isError: filesError } =
    useFiles();
  const { lists } = useLists();
  const { items: listItems, isLoading: listItemsLoading, isError: listItemsError } = useListDetail(activeListId);
  const { tags: allTags } = useTags();
  const { items: tagItems, isLoading: tagItemsLoading, isError: tagItemsError } = useTagItems(activeTagId);

  const createList = useCreateList();
  const deleteList = useDeleteList();
  const addToList = useAddToList();
  const removeFromList = useRemoveFromList(activeListId);
  const createTag = useCreateTag();
  const attachTag = useAttachTag(activeListId);
  const detachTag = useDetachTag(activeListId);

  function handleViewChange(next) {
    setView(next);
    localStorage.setItem('fileView', next);
  }

  function handleSelectList(listId) {
    setActiveTagId(null);
    setActiveListId(listId);
  }

  function handleSelectTag(tagId) {
    setActiveListId(null);
    setActiveTagId(tagId);
  }

  function handleDeleteList(listId) {
    deleteList.mutate(listId);
    if (activeListId === listId) {
      setActiveListId(null);
    }
  }

  const activeList = lists.find((l) => l.id === activeListId);
  const activeTag = allTags.find((t) => t.id === activeTagId);

  const loading = activeListId ? listItemsLoading : activeTagId ? tagItemsLoading : filesLoading;
  const error = activeListId
    ? listItemsError && 'Failed to load this list.'
    : activeTagId
      ? tagItemsError && 'Failed to load items for this label.'
      : filesError && 'Failed to load files from Google Drive.';

  const visibleFiles = useMemo(
    () => files.filter((f) => f.name.toLowerCase().includes(search.toLowerCase())),
    [files, search]
  );
  const visibleListItems = useMemo(
    () => listItems.filter((i) => (i.fileName || '').toLowerCase().includes(search.toLowerCase())),
    [listItems, search]
  );
  const visibleTagItems = useMemo(
    () => tagItems.filter((i) => (i.fileName || '').toLowerCase().includes(search.toLowerCase())),
    [tagItems, search]
  );

  return (
    <div className="flex h-screen flex-col bg-white dark:bg-[#202124]">
      <TopBar search={search} onSearchChange={setSearch} user={user} onLogout={logout} />

      <div className="flex flex-1 overflow-hidden">
        <ListsSidebar
          lists={lists}
          activeListId={activeListId}
          onSelectList={handleSelectList}
          onCreateList={(name) => createList.mutate(name)}
          onDeleteList={handleDeleteList}
          tags={allTags}
          activeTagId={activeTagId}
          onSelectTag={handleSelectTag}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="flex items-center justify-between border-b border-[#e0e0e0] px-6 py-4 dark:border-[#3c4043]">
            <h1 className="text-lg font-normal text-[#202124] dark:text-[#e8eaed]">
              {activeList ? activeList.name : activeTag ? `Label: ${activeTag.name}` : 'All Drive Files'}
            </h1>
            <div className="flex items-center gap-3">
              <FilterDropdown
                lists={lists}
                activeListId={activeListId}
                onSelectList={handleSelectList}
                tags={allTags}
                activeTagId={activeTagId}
                onSelectTag={handleSelectTag}
              />
              {!activeListId && !activeTagId && <ViewToggle view={view} onChange={handleViewChange} />}
            </div>
          </div>

          {error && (
            <div className="mx-6 mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
              {error}
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-24">
              <Spinner />
            </div>
          )}

          {!loading && !activeListId && !activeTagId && (
            <>
              {visibleFiles.length === 0 && !error && (
                <p className="py-12 text-center text-sm text-[#5f6368] dark:text-[#9aa0a6]">
                  {search ? 'No files match your search.' : 'No files found in your Google Drive.'}
                </p>
              )}

              {visibleFiles.length > 0 && view === 'list' && (
                <>
                  <div className="flex items-center border-b border-[#e0e0e0] px-4 py-2 text-xs font-medium text-[#5f6368] dark:border-[#3c4043] dark:text-[#9aa0a6]">
                    <span className="ml-9 flex-1">Name</span>
                    <span className="w-28 shrink-0 text-right">Last modified</span>
                  </div>
                  {visibleFiles.map((file) => (
                    <FileRow
                      key={file.id}
                      file={file}
                      lists={lists}
                      onAddToList={(listId, f) => addToList.mutate({ listId, file: f })}
                    />
                  ))}
                </>
              )}

              {visibleFiles.length > 0 && view === 'grid' && (
                <div className="grid grid-cols-2 gap-4 px-6 py-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {visibleFiles.map((file) => (
                    <FileGridItem
                      key={file.id}
                      file={file}
                      lists={lists}
                      onAddToList={(listId, f) => addToList.mutate({ listId, file: f })}
                    />
                  ))}
                </div>
              )}

              {hasNextPage && !search && (
                <div className="flex justify-center py-4">
                  <button
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="rounded-full border border-[#dadce0] px-5 py-2 text-sm font-medium text-[#1a73e8] hover:bg-[#eaf1fb] disabled:opacity-50 dark:border-[#5f6368] dark:hover:bg-[#3c4043]"
                  >
                    {isFetchingNextPage ? 'Loading…' : 'Load more files'}
                  </button>
                </div>
              )}
            </>
          )}

          {!loading && activeListId && visibleListItems.length === 0 && !error && (
            <p className="py-12 text-center text-sm text-[#5f6368] dark:text-[#9aa0a6]">
              {search ? 'No files match your search.' : 'No files in this list yet. Add some from "All Drive Files".'}
            </p>
          )}
          {!loading && activeListId && visibleListItems.length > 0 && (
            <div>
              {visibleListItems.map((item) => (
                <ListItemRow
                  key={item.id}
                  item={item}
                  allTags={allTags}
                  onRemove={(itemId) => removeFromList.mutate(itemId)}
                  onAttachTag={(itemId, tag) => attachTag.mutateAsync({ itemId, tag })}
                  onDetachTag={(itemId, tagId) => detachTag.mutate({ itemId, tagId })}
                  onCreateTag={(name) => createTag.mutateAsync(name)}
                />
              ))}
            </div>
          )}

          {!loading && activeTagId && visibleTagItems.length === 0 && !error && (
            <p className="py-12 text-center text-sm text-[#5f6368] dark:text-[#9aa0a6]">
              {search ? 'No files match your search.' : 'No files carry this label yet.'}
            </p>
          )}
          {!loading && activeTagId && visibleTagItems.length > 0 && (
            <div>
              {visibleTagItems.map((item) => {
                const parentList = lists.find((l) => l.id === item.listId);
                return (
                  <Link
                    key={item.id}
                    to={`/file/${item.driveFileId}`}
                    className="flex items-center gap-4 border-b border-[#f1f3f4] px-4 py-2.5 hover:bg-[#f8f9fa] dark:border-[#3c4043] dark:hover:bg-[#292a2d]"
                  >
                    <span className="min-w-0 flex-1 truncate text-sm text-[#3c4043] dark:text-[#e8eaed]">
                      {item.fileName}
                    </span>
                    {parentList && (
                      <span className="shrink-0 text-xs text-[#5f6368] dark:text-[#9aa0a6]">{parentList.name}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
