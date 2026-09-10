import { useEffect, useMemo, useState } from 'react';
import {
  useFiles,
  useLists,
  useListDetail,
  useTags,
  useTagItems,
  useFrequentFiles,
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
import { buildFilterConfig } from '../utils/filterConfig';
import { canEdit as roleCanEdit, isOwner as roleIsOwner } from '../constants/roles';
import { useConfirm } from '../context/ConfirmContext';
import { useAuth } from '../context/AuthContext';

export function useFilesPage() {
  const confirm = useConfirm();
  const { user } = useAuth();
  const [activeListId, setActiveListId] = useState(() => localStorage.getItem('activeListId') || null);
  const [activeTagId, setActiveTagId] = useState(() => localStorage.getItem('activeTagId') || null);
  const [frequentActive, setFrequentActive] = useState(() => localStorage.getItem('frequentActive') === 'true');
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
  const {
    frequentFiles,
    isLoading: frequentLoading,
    isError: frequentError,
  } = useFrequentFiles(frequentActive);

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

  useEffect(() => {
    if (frequentActive) localStorage.setItem('frequentActive', 'true');
    else localStorage.removeItem('frequentActive');
  }, [frequentActive]);

  function handleViewChange(next) {
    setView(next);
    localStorage.setItem('fileView', next);
  }

  function handleSelectList(listId) {
    setActiveTagId(null);
    setFrequentActive(false);
    setActiveListId(listId);
    setLabelFilter(null);
    setListFilter(null);
  }

  function handleSelectTag(tagId) {
    setActiveListId(null);
    setFrequentActive(false);
    setActiveTagId(tagId);
    setLabelFilter(null);
    setListFilter(null);
  }

  function handleSelectFrequent() {
    setActiveListId(null);
    setActiveTagId(null);
    setFrequentActive(true);
    setLabelFilter(null);
    setListFilter(null);
  }

  async function handleDeleteList(listId) {
    const list = lists.find((l) => l.id === listId);
    const confirmed = await confirm({
      title: 'Delete this list?',
      message: `"${list?.name}" and its contents will be removed. The files themselves stay in your Google Drive.`,
      confirmLabel: 'Delete',
      destructive: true,
    });
    if (!confirmed) return;

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

  const searchPlaceholder = frequentActive
    ? 'Search frequently used'
    : activeList
    ? `Search in "${activeList.name}"`
    : activeTag
      ? `Search files labeled "${activeTag.name}"`
      : 'Search in Drive';

  const loading = frequentActive
    ? frequentLoading
    : activeListId
      ? listItemsLoading
      : activeTagId
        ? tagItemsLoading
        : filesLoading;
  const error = frequentActive
    ? frequentError && 'Failed to load your frequently used files.'
    : activeListId
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
      listItems
        .filter(
          (i) =>
            (i.fileName || '').toLowerCase().includes(search.toLowerCase()) &&
            (!labelFilter || i.tags.some((t) => t.id === labelFilter))
        )
        .map((i) => ({
          ...i,
          addedByLabel:
            i.addedBy && i.addedBy !== user?.id ? i.addedByName || i.addedByEmail : null,
        })),
    [listItems, search, labelFilter, user?.id]
  );
  const visibleFrequentFiles = useMemo(
    () => frequentFiles.filter((f) => (f.fileName || '').toLowerCase().includes(search.toLowerCase())),
    [frequentFiles, search]
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

  const filterDropdown = buildFilterConfig({
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

    // files / list / tag data
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

    // handlers
    handleViewChange,
    handleSelectList,
    handleSelectTag,
    handleSelectFrequent,
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
