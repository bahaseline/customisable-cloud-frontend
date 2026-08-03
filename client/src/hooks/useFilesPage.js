import { useEffect, useMemo, useState } from 'react';
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
  useUpdateTagColor,
  useAttachTag,
  useDetachTag,
} from './queries';

export function useFilesPage() {
  const [activeListId, setActiveListId] = useState(() => localStorage.getItem('activeListId') || null);
  const [activeTagId, setActiveTagId] = useState(() => localStorage.getItem('activeTagId') || null);
  const [search, setSearch] = useState('');
  const [view, setView] = useState(() => localStorage.getItem('fileView') || 'list');
  const [addModalOpen, setAddModalOpen] = useState(false);

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
  const updateTagColor = useUpdateTagColor();
  const attachTag = useAttachTag(activeListId);
  const detachTag = useDetachTag(activeListId);

  useEffect(() => {
    if (activeListId) localStorage.setItem('activeListId', activeListId);
    else localStorage.removeItem('activeListId');
  }, [activeListId]);

  useEffect(() => {
    if (activeTagId) localStorage.setItem('activeTagId', activeTagId);
    else localStorage.removeItem('activeTagId');
  }, [activeTagId]);

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

  const searchPlaceholder = activeList
    ? `Search in "${activeList.name}"`
    : activeTag
      ? `Search files labeled "${activeTag.name}"`
      : 'Search in Drive';

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

  const existingDriveFileIds = useMemo(() => new Set(listItems.map((i) => i.driveFileId)), [listItems]);

  return {
    // context
    lists,
    allTags,
    activeListId,
    activeTagId,
    activeList,
    activeTag,
    search,
    setSearch,
    searchPlaceholder,
    view,
    addModalOpen,
    setAddModalOpen,

    // files / list / tag data
    files,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    visibleFiles,
    visibleListItems,
    visibleTagItems,
    existingDriveFileIds,
    loading,
    error,

    // handlers
    handleViewChange,
    handleSelectList,
    handleSelectTag,
    handleDeleteList,
    onCreateList: (name) => createList.mutate(name),
    onAddToList: (listId, file) => addToList.mutate({ listId, file }),
    onAddFileToActiveList: (file) => addToList.mutate({ listId: activeListId, file }),
    onRemoveFromList: (itemId) => removeFromList.mutate(itemId),
    onCreateTag: (name, color) => createTag.mutateAsync({ name, color }),
    onChangeTagColor: (tagId, color) => updateTagColor.mutate({ tagId, color }),
    onAttachTag: (itemId, tag) => attachTag.mutateAsync({ itemId, tag }),
    onDetachTag: (itemId, tagId) => detachTag.mutate({ itemId, tagId }),
  };
}
