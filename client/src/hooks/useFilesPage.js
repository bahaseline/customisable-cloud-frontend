import { useEffect, useMemo, useState } from 'react';
import {
  useFiles,
  useLists,
  useListDetail,
  useTags,
  useTagItems,
  useCreateList,
  useDeleteList,
  useRenameList,
  useAddToList,
  useRemoveFromList,
  useCreateTag,
  useUpdateTagColor,
  useAttachTag,
  useDetachTag,
} from './queries';
import { useFilterConfig } from './useFilterConfig';
import { canEdit as roleCanEdit, isOwner as roleIsOwner } from '../constants/roles';

export function useFilesPage() {
  const [activeListId, setActiveListId] = useState(() => localStorage.getItem('activeListId') || null);
  const [activeTagId, setActiveTagId] = useState(() => localStorage.getItem('activeTagId') || null);
  const [search, setSearch] = useState('');
  const [view, setView] = useState(() => localStorage.getItem('fileView') || 'list');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [shareListId, setShareListId] = useState(null);
  const [labelFilter, setLabelFilter] = useState(null);
  const [listFilter, setListFilter] = useState(null);

  const { files, hasNextPage, isFetchingNextPage, fetchNextPage, isLoading: filesLoading, isError: filesError } =
    useFiles();
  const { lists } = useLists();
  const { items: listItems, isLoading: listItemsLoading, isError: listItemsError } = useListDetail(activeListId);
  const { tags: allTags } = useTags();
  const { items: tagItems, isLoading: tagItemsLoading, isError: tagItemsError } = useTagItems(activeTagId);

  const createList = useCreateList();
  const deleteList = useDeleteList();
  const renameList = useRenameList();
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
    setLabelFilter(null);
    setListFilter(null);
  }

  function handleSelectTag(tagId) {
    setActiveListId(null);
    setActiveTagId(tagId);
    setLabelFilter(null);
    setListFilter(null);
  }

  function handleDeleteList(listId) {
    deleteList.mutate(listId);
    if (activeListId === listId) {
      setActiveListId(null);
    }
  }

  const activeList = lists.find((l) => l.id === activeListId);
  const activeTag = allTags.find((t) => t.id === activeTagId);
  const canEdit = roleCanEdit(activeList?.role);
  const isOwner = roleIsOwner(activeList?.role);
  const shareList = lists.find((l) => l.id === shareListId);

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
    () =>
      listItems.filter(
        (i) =>
          (i.fileName || '').toLowerCase().includes(search.toLowerCase()) &&
          (!labelFilter || i.tags.some((t) => t.id === labelFilter))
      ),
    [listItems, search, labelFilter]
  );
  const visibleTagItems = useMemo(
    () =>
      tagItems.filter(
        (i) =>
          (i.fileName || '').toLowerCase().includes(search.toLowerCase()) &&
          (!listFilter || i.listId === listFilter)
      ),
    [tagItems, search, listFilter]
  );

  const labelsInList = useMemo(() => {
    const seen = new Map();
    listItems.forEach((i) => i.tags.forEach((t) => seen.set(t.id, t)));
    return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [listItems]);

  const listsInLabel = useMemo(() => {
    const ids = new Set(tagItems.map((i) => i.listId));
    return lists.filter((l) => ids.has(l.id));
  }, [tagItems, lists]);

  const existingDriveFileIds = useMemo(() => new Set(listItems.map((i) => i.driveFileId)), [listItems]);

  const filterDropdown = useFilterConfig({
    activeListId,
    activeTagId,
    lists,
    allTags,
    labelsInList,
    listsInLabel,
    labelFilter,
    setLabelFilter,
    listFilter,
    setListFilter,
    onSelectList: handleSelectList,
    onSelectTag: handleSelectTag,
  });

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
    canEdit,
    isOwner,
    shareList,
    shareListId,
    setShareListId,

    // files / list / tag data
    files,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    visibleFiles,
    visibleListItems,
    visibleTagItems,
    existingDriveFileIds,
    filterDropdown,
    loading,
    error,

    // handlers
    handleViewChange,
    handleSelectList,
    handleSelectTag,
    handleDeleteList,
    onCreateList: (name) => createList.mutate(name),
    onRenameList: (listId, name) => renameList.mutate({ listId, name }),
    onAddToList: (listId, file) => addToList.mutate({ listId, file }),
    onAddFileToActiveList: (file) => addToList.mutate({ listId: activeListId, file }),
    onRemoveFromList: (itemId) => removeFromList.mutate(itemId),
    onCreateTag: (name, color) => createTag.mutateAsync({ name, color }),
    onChangeTagColor: (tagId, color) => updateTagColor.mutate({ tagId, color }),
    onAttachTag: (itemId, tag) => attachTag.mutateAsync({ itemId, tag }),
    onDetachTag: (itemId, tagId) => detachTag.mutate({ itemId, tagId }),
  };
}
