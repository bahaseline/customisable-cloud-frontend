import { useEffect, useMemo, useState } from 'react';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import TopBar from '../components/TopBar';
import ListsSidebar from '../components/ListsSidebar';
import FileRow from '../components/FileRow';
import FileGridItem from '../components/FileGridItem';
import ViewToggle from '../components/ViewToggle';
import ListItemRow from '../components/ListItemRow';

export default function FilesPage() {
  const { user, logout } = useAuth();
  const [files, setFiles] = useState([]);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lists, setLists] = useState([]);
  const [activeListId, setActiveListId] = useState(null);
  const [listItems, setListItems] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState(() => localStorage.getItem('fileView') || 'list');

  function handleViewChange(next) {
    setView(next);
    localStorage.setItem('fileView', next);
  }

  useEffect(() => {
    loadFiles();
    loadLists();
    loadTags();
  }, []);

  useEffect(() => {
    if (activeListId) {
      loadListItems(activeListId);
    }
  }, [activeListId]);

  async function loadFiles() {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/api/files');
      setFiles(res.data.files);
      setNextPageToken(res.data.nextPageToken);
    } catch (err) {
      setError('Failed to load files from Google Drive.');
    } finally {
      setLoading(false);
    }
  }

  async function loadMoreFiles() {
    if (!nextPageToken) return;
    setLoadingMore(true);
    try {
      const res = await apiClient.get('/api/files', { params: { pageToken: nextPageToken } });
      setFiles((prev) => [...prev, ...res.data.files]);
      setNextPageToken(res.data.nextPageToken);
    } catch (err) {
      setError('Failed to load more files.');
    } finally {
      setLoadingMore(false);
    }
  }

  async function loadLists() {
    try {
      const res = await apiClient.get('/api/lists');
      setLists(res.data.lists);
    } catch (err) {
      // Lists sidebar just stays empty; files view still works.
    }
  }

  async function loadListItems(listId) {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get(`/api/lists/${listId}`);
      setListItems(res.data.items);
    } catch (err) {
      setError('Failed to load this list.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateList(name) {
    const res = await apiClient.post('/api/lists', { name });
    setLists((prev) => [res.data.list, ...prev]);
  }

  async function handleDeleteList(listId) {
    await apiClient.delete(`/api/lists/${listId}`);
    setLists((prev) => prev.filter((l) => l.id !== listId));
    if (activeListId === listId) {
      setActiveListId(null);
    }
  }

  async function handleAddToList(listId, file) {
    await apiClient.post(`/api/lists/${listId}/items`, {
      driveFileId: file.id,
      fileName: file.name,
    });
    if (activeListId === listId) {
      loadListItems(listId);
    }
  }

  async function handleRemoveFromList(itemId) {
    await apiClient.delete(`/api/lists/${activeListId}/items/${itemId}`);
    setListItems((prev) => prev.filter((item) => item.id !== itemId));
  }

  async function loadTags() {
    try {
      const res = await apiClient.get('/api/tags');
      setAllTags(res.data.tags);
    } catch (err) {
      // Tag suggestions just stay empty; creating new tags still works.
    }
  }

  async function handleCreateTag(name) {
    const res = await apiClient.post('/api/tags', { name });
    setAllTags((prev) => (prev.some((t) => t.id === res.data.tag.id) ? prev : [...prev, res.data.tag]));
    return res.data.tag;
  }

  async function handleAttachTag(itemId, tag) {
    await apiClient.post(`/api/lists/${activeListId}/items/${itemId}/tags`, { tagId: tag.id });
    setListItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, tags: [...item.tags, tag] } : item))
    );
  }

  async function handleDetachTag(itemId, tagId) {
    await apiClient.delete(`/api/lists/${activeListId}/items/${itemId}/tags/${tagId}`);
    setListItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, tags: item.tags.filter((t) => t.id !== tagId) } : item
      )
    );
  }

  const activeList = lists.find((l) => l.id === activeListId);

  const visibleFiles = useMemo(
    () => files.filter((f) => f.name.toLowerCase().includes(search.toLowerCase())),
    [files, search]
  );
  const visibleListItems = useMemo(
    () => listItems.filter((i) => (i.fileName || '').toLowerCase().includes(search.toLowerCase())),
    [listItems, search]
  );

  return (
    <div className="flex h-screen flex-col bg-white dark:bg-[#202124]">
      <TopBar search={search} onSearchChange={setSearch} user={user} onLogout={logout} />

      <div className="flex flex-1 overflow-hidden">
        <ListsSidebar
          lists={lists}
          activeListId={activeListId}
          onSelectList={setActiveListId}
          onCreateList={handleCreateList}
          onDeleteList={handleDeleteList}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="flex items-center justify-between border-b border-[#e0e0e0] px-6 py-4 dark:border-[#3c4043]">
            <h1 className="text-lg font-normal text-[#202124] dark:text-[#e8eaed]">
              {activeList ? activeList.name : 'All Drive Files'}
            </h1>
            {!activeListId && <ViewToggle view={view} onChange={handleViewChange} />}
          </div>

          {error && (
            <div className="mx-6 mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
              {error}
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-24">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#dadce0] border-t-[#1a73e8] dark:border-[#3c4043]" />
            </div>
          )}

          {!loading && !activeListId && (
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
                    <FileRow key={file.id} file={file} lists={lists} onAddToList={handleAddToList} />
                  ))}
                </>
              )}

              {visibleFiles.length > 0 && view === 'grid' && (
                <div className="grid grid-cols-2 gap-4 px-6 py-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {visibleFiles.map((file) => (
                    <FileGridItem key={file.id} file={file} lists={lists} onAddToList={handleAddToList} />
                  ))}
                </div>
              )}

              {nextPageToken && !search && (
                <div className="flex justify-center py-4">
                  <button
                    onClick={loadMoreFiles}
                    disabled={loadingMore}
                    className="rounded-full border border-[#dadce0] px-5 py-2 text-sm font-medium text-[#1a73e8] hover:bg-[#eaf1fb] disabled:opacity-50 dark:border-[#5f6368] dark:hover:bg-[#3c4043]"
                  >
                    {loadingMore ? 'Loading…' : 'Load more files'}
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
                  onRemove={handleRemoveFromList}
                  onAttachTag={handleAttachTag}
                  onDetachTag={handleDetachTag}
                  onCreateTag={handleCreateTag}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
