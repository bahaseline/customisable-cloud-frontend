import { useAuth } from '../context/AuthContext';
import { useFilesPage } from '../hooks/useFilesPage';
import { useSidebarWidth } from '../hooks/useSidebarWidth';
import TopBar from '../components/TopBar';
import ListsSidebar from '../components/ListsSidebar';
import FileRow from '../components/FileRow';
import FileGridItem from '../components/FileGridItem';
import ViewToggle from '../components/ViewToggle';
import ListItemRow from '../components/ListItemRow';
import TagItemRow from '../components/TagItemRow';
import FileLinkRow from '../components/FileLinkRow';
import EmptyState from '../components/EmptyState';
import Spinner from '../components/Spinner';
import FilterDropdown from '../components/FilterDropdown';
import AddFileModal from '../components/AddFileModal';
import ShareListModal from '../components/ShareListModal';
import { GripIcon } from '../components/icons';
import { ACCESS_HINTS } from '../constants/roles';

export default function FilesPage() {
  const { user, logout } = useAuth();
  const { width: sidebarWidth, startResizing } = useSidebarWidth();
  const {
    lists,
    allTags,
    activeListId,
    activeTagId,
    frequentActive,
    activeList,
    activeTag,
    search,
    setSearch,
    searchPlaceholder,
    view,
    addModalOpen,
    setAddModalOpen,
    canEdit,
    isOwner,
    shareList,
    shareListId,
    setShareListId,
    files,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    visibleFiles,
    visibleListItems,
    visibleTagItems,
    visibleFrequentFiles,
    existingDriveFileIds,
    filterDropdown,
    loading,
    error,
    handleViewChange,
    handleSelectList,
    handleSelectTag,
    handleSelectFrequent,
    handleDeleteList,
    handleDeleteTag,
    onCreateList,
    onRenameList,
    onAddToList,
    onAddFileToActiveList,
    onRemoveFromList,
    onCreateTag,
    onSaveTag,
    onAttachTag,
    onDetachTag,
  } = useFilesPage();

  return (
    <div className="flex h-screen flex-col bg-white dark:bg-[#202124]">
      <TopBar
        search={search}
        onSearchChange={setSearch}
        user={user}
        onLogout={logout}
        placeholder={searchPlaceholder}
      />

      <div className="flex flex-1 overflow-hidden">
        <ListsSidebar
          lists={lists}
          activeListId={activeListId}
          onSelectList={handleSelectList}
          frequentActive={frequentActive}
          onSelectFrequent={handleSelectFrequent}
          onCreateList={onCreateList}
          onRenameList={onRenameList}
          onDeleteList={handleDeleteList}
          onShareList={setShareListId}
          tags={allTags}
          activeTagId={activeTagId}
          onSelectTag={handleSelectTag}
          onCreateTag={onCreateTag}
          onSaveTag={onSaveTag}
          onDeleteTag={handleDeleteTag}
          currentUserId={user?.id}
          width={sidebarWidth}
        />

        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize sidebar"
          onMouseDown={startResizing}
          className="group relative w-2.5 shrink-0 cursor-col-resize"
        >
          <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-[#e0e0e0] group-hover:bg-[#dadce0] group-active:bg-[#1a73e8] dark:bg-[#3c4043] dark:group-hover:bg-[#5f6368]" />
          <GripIcon className="absolute left-1/2 top-1/2 h-6 w-2 -translate-x-1/2 -translate-y-1/2 text-[#bdc1c6] opacity-70 group-hover:text-[#5f6368] group-hover:opacity-100 group-active:text-[#1a73e8] dark:text-[#5f6368] dark:group-hover:text-[#9aa0a6]" />
        </div>

        <main className="flex-1 overflow-y-auto">
          <div className="flex items-center justify-between border-b border-[#e0e0e0] px-6 py-4 dark:border-[#3c4043]">
            <div className="flex min-w-0 items-center gap-2">
              <h1 className="truncate text-lg font-normal text-[#202124] dark:text-[#e8eaed]">
                {frequentActive
                  ? 'Frequently used'
                  : activeList
                    ? activeList.name
                    : activeTag
                      ? `Tag: ${activeTag.name}`
                      : 'All Drive Files'}
              </h1>
              {activeList && !isOwner && (
                <span className="shrink-0 rounded-full bg-[#f1f3f4] px-2 py-0.5 text-xs text-[#5f6368] dark:bg-[#3c4043] dark:text-[#9aa0a6]">
                  Shared with you · {ACCESS_HINTS[activeList.role]}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {activeListId && isOwner && (
                <button
                  onClick={() => setShareListId(activeListId)}
                  className="rounded-full border border-[#dadce0] px-3 py-1.5 text-sm font-medium text-[#3c4043] hover:bg-[#f1f3f4] dark:border-[#5f6368] dark:text-[#e8eaed] dark:hover:bg-[#3c4043]"
                >
                  Share
                </button>
              )}
              {activeListId && canEdit && (
                <button
                  onClick={() => setAddModalOpen(true)}
                  className="flex items-center gap-1.5 rounded-full bg-[#1a73e8] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#1765cc]"
                >
                  <span className="text-base leading-none">+</span>
                  Add file
                </button>
              )}
              <FilterDropdown buttonLabel={filterDropdown.buttonLabel} groups={filterDropdown.groups} />
              {!activeListId && !activeTagId && !frequentActive && (
                <ViewToggle view={view} onChange={handleViewChange} />
              )}
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

          {!loading && !activeListId && !activeTagId && !frequentActive && (
            <>
              {visibleFiles.length === 0 && !error && (
                <EmptyState
                  message={search ? 'No files match your search.' : 'No files found in your Google Drive.'}
                />
              )}

              {visibleFiles.length > 0 && view === 'list' && (
                <>
                  <div className="flex items-center border-b border-[#e0e0e0] px-4 py-2 text-xs font-medium text-[#5f6368] dark:border-[#3c4043] dark:text-[#9aa0a6]">
                    <span className="ml-9 flex-1">Name</span>
                    <span className="w-28 shrink-0 text-right">Last modified</span>
                  </div>
                  {visibleFiles.map((file) => (
                    <FileRow key={file.id} file={file} lists={lists} onAddToList={onAddToList} />
                  ))}
                </>
              )}

              {visibleFiles.length > 0 && view === 'grid' && (
                <div className="grid grid-cols-2 gap-4 px-6 py-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {visibleFiles.map((file) => (
                    <FileGridItem key={file.id} file={file} lists={lists} onAddToList={onAddToList} />
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

          {!loading && frequentActive && visibleFrequentFiles.length === 0 && !error && (
            <EmptyState
              message={
                search
                  ? 'No files match your search.'
                  : 'Nothing here yet. Files you open will start appearing, most used first.'
              }
            />
          )}
          {!loading && frequentActive && visibleFrequentFiles.length > 0 && (
            <div>
              {visibleFrequentFiles.map((file) => (
                <FileLinkRow
                  key={file.driveFileId}
                  to={`/file/${file.driveFileId}`}
                  name={file.fileName}
                  meta={`opened ${file.openCount} ${file.openCount === 1 ? 'time' : 'times'}`}
                />
              ))}
            </div>
          )}

          {!loading && activeListId && visibleListItems.length === 0 && !error && (
            <EmptyState
              message={
                search ? 'No files match your search.' : 'No files in this list yet. Add some from "All Drive Files".'
              }
            />
          )}
          {!loading && activeListId && visibleListItems.length > 0 && (
            <div>
              {visibleListItems.map((item) => (
                <ListItemRow
                  key={item.id}
                  item={item}
                  allTags={allTags}
                  canEdit={canEdit}
                  canTag={!!activeList}
                  onRemove={onRemoveFromList}
                  onAttachTag={onAttachTag}
                  onDetachTag={onDetachTag}
                  onCreateTag={onCreateTag}
                />
              ))}
            </div>
          )}

          {!loading && activeTagId && visibleTagItems.length === 0 && !error && (
            <EmptyState message={search ? 'No files match your search.' : 'No files carry this tag yet.'} />
          )}
          {!loading && activeTagId && visibleTagItems.length > 0 && (
            <div>
              {visibleTagItems.map((item) => (
                <TagItemRow
                  key={item.id}
                  item={item}
                  parentListName={lists.find((l) => l.id === item.listId)?.name}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      <ShareListModal
        open={!!shareListId}
        onClose={() => setShareListId(null)}
        listId={shareListId}
        listName={shareList?.name}
      />

      {activeListId && canEdit && (
        <AddFileModal
          open={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          files={files}
          existingDriveFileIds={existingDriveFileIds}
          onAdd={onAddFileToActiveList}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          onLoadMore={() => fetchNextPage()}
        />
      )}
    </div>
  );
}
