import { useMemo, useState } from 'react';
import { FolderIcon, ClockIcon } from './icons';
import ListNameForm from './ListNameForm';
import TagCreateModal from './TagCreateModal';
import SidebarSearch from './SidebarSearch';
import SidebarListRow from './SidebarListRow';
import SidebarTagRow from './SidebarTagRow';
import { useListsSidebar } from '../hooks/useListsSidebar';
import { isOwner } from '../constants/roles';

export default function ListsSidebar({
  lists,
  activeListId,
  onSelectList,
  frequentActive,
  onSelectFrequent,
  onCreateList,
  onRenameList,
  onDeleteList,
  onShareList,
  tags,
  activeTagId,
  onSelectTag,
  onCreateTag,
  onSaveTag,
  onDeleteTag,
  currentUserId,
  width,
}) {
  const { editing, startCreating, startRenaming, stopEditing } = useListsSidebar();
  const [listQuery, setListQuery] = useState('');
  const [sharedQuery, setSharedQuery] = useState('');
  const [tagQuery, setTagQuery] = useState('');
  const [creatingTag, setCreatingTag] = useState(false);

  const ownedLists = useMemo(() => lists.filter((l) => isOwner(l.role)), [lists]);
  const sharedLists = useMemo(() => lists.filter((l) => !isOwner(l.role)), [lists]);

  const visibleLists = useMemo(
    () =>
      ownedLists.filter(
        (l) => l.id === editing || l.name.toLowerCase().includes(listQuery.trim().toLowerCase())
      ),
    [ownedLists, listQuery, editing]
  );
  const visibleSharedLists = useMemo(
    () => sharedLists.filter((l) => l.name.toLowerCase().includes(sharedQuery.trim().toLowerCase())),
    [sharedLists, sharedQuery]
  );
  const visibleTags = useMemo(
    () => (tags || []).filter((t) => t.name.toLowerCase().includes(tagQuery.trim().toLowerCase())),
    [tags, tagQuery]
  );

  return (
    <aside
      style={width ? { width } : undefined}
      className="flex w-60 shrink-0 flex-col overflow-y-auto bg-white px-3 py-4 dark:bg-grey-900"
    >
      {editing === 'new' ? (
        <ListNameForm
          inputId="new-list-name"
          submitLabel="Create"
          cancelOnBlur
          onSubmit={(name) => {
            onCreateList(name);
            stopEditing();
          }}
          onCancel={stopEditing}
        />
      ) : (
        <button
          onClick={startCreating}
          className="mb-4 flex w-fit items-center gap-3 rounded-2xl bg-white px-5 py-3.5 text-sm font-medium text-grey-800 shadow-[0_1px_3px_1px_rgba(60,64,67,0.15),0_1px_2px_0_rgba(60,64,67,0.3)] hover:shadow-[0_1px_3px_1px_rgba(60,64,67,0.25),0_2px_4px_1px_rgba(60,64,67,0.2)] dark:bg-grey-850 dark:text-grey-200"
        >
          <span className="text-xl leading-none text-primary">+</span>
          New list
        </button>
      )}

      <nav className="flex flex-col gap-0.5">
        <button
          onClick={() => onSelectList(null)}
          className={`flex items-center gap-4 rounded-r-full px-4 py-2 text-left text-sm ${
            activeListId === null && !activeTagId && !frequentActive
              ? 'bg-primary-soft font-medium text-primary dark:bg-grey-800'
              : 'text-grey-800 hover:bg-grey-100 dark:text-grey-200 dark:hover:bg-grey-850'
          }`}
        >
          <FolderIcon
            className={`h-5 w-5 shrink-0 ${activeListId === null && !activeTagId && !frequentActive ? 'text-primary' : 'text-grey-700 dark:text-grey-500'}`}
          />
          All Drive Files
        </button>

        <button
          onClick={onSelectFrequent}
          className={`flex items-center gap-4 rounded-r-full px-4 py-2 text-left text-sm ${
            frequentActive
              ? 'bg-primary-soft font-medium text-primary dark:bg-grey-800'
              : 'text-grey-800 hover:bg-grey-100 dark:text-grey-200 dark:hover:bg-grey-850'
          }`}
        >
          <ClockIcon
            className={`h-5 w-5 shrink-0 ${frequentActive ? 'text-primary' : 'text-grey-700 dark:text-grey-500'}`}
          />
          Frequently used
        </button>

        {ownedLists.length > 0 && (
          <p className="mb-1 mt-4 px-4 text-xs font-medium uppercase tracking-wide text-grey-600 dark:text-grey-500">
            My Lists
          </p>
        )}

        {ownedLists.length > 4 && (
          <div className="px-4">
            <SidebarSearch value={listQuery} onChange={setListQuery} placeholder="Search lists…" />
          </div>
        )}

        {visibleLists.length === 0 && listQuery && (
          <p className="px-4 py-2 text-xs text-grey-500">No lists match &ldquo;{listQuery}&rdquo;.</p>
        )}

        {visibleLists.map((list) => (
          <SidebarListRow
            key={list.id}
            list={list}
            active={activeListId === list.id}
            editing={editing === list.id}
            onSelect={onSelectList}
            onStartRenaming={startRenaming}
            onRename={(id, name) => {
              onRenameList(id, name);
              stopEditing();
            }}
            onCancelRename={stopEditing}
            onShare={onShareList}
            onDelete={onDeleteList}
          />
        ))}

        {sharedLists.length > 0 && (
          <p className="mb-1 mt-4 px-4 text-xs font-medium uppercase tracking-wide text-grey-600 dark:text-grey-500">
            Shared with me
          </p>
        )}

        {sharedLists.length > 0 && (
          <div className="px-4">
            <SidebarSearch value={sharedQuery} onChange={setSharedQuery} placeholder="Search shared lists…" />
          </div>
        )}

        {visibleSharedLists.length === 0 && sharedQuery && (
          <p className="px-4 py-2 text-xs text-grey-500">No lists match &ldquo;{sharedQuery}&rdquo;.</p>
        )}

        {visibleSharedLists.map((list) => (
          <SidebarListRow key={list.id} list={list} active={activeListId === list.id} onSelect={onSelectList} />
        ))}

        {tags && (
          <div className="mb-1 mt-4 flex items-center justify-between px-4">
            <p className="text-xs font-medium uppercase tracking-wide text-grey-600 dark:text-grey-500">Tags</p>
            <button
              onClick={() => setCreatingTag(true)}
              aria-label="New tag"
              className="rounded-full p-1 text-grey-500 hover:bg-grey-100 hover:text-primary dark:hover:bg-grey-800"
            >
              <span className="block text-sm leading-none">+</span>
            </button>
          </div>
        )}

        {tags && tags.length > 4 && (
          <div className="px-4">
            <SidebarSearch value={tagQuery} onChange={setTagQuery} placeholder="Search tags…" />
          </div>
        )}

        {tags && tags.length === 0 && !tagQuery && (
          <p className="px-4 py-2 text-xs text-grey-500">No tags yet - create one to get started.</p>
        )}

        {tags && visibleTags.length === 0 && tagQuery && (
          <p className="px-4 py-2 text-xs text-grey-500">No tags match &ldquo;{tagQuery}&rdquo;.</p>
        )}

        {visibleTags.map((tag) => (
          <SidebarTagRow
            key={tag.id}
            tag={tag}
            active={activeTagId === tag.id}
            currentUserId={currentUserId}
            onSelectTag={onSelectTag}
            onSaveTag={onSaveTag}
            onDeleteTag={onDeleteTag}
          />
        ))}
      </nav>

      <TagCreateModal open={creatingTag} onClose={() => setCreatingTag(false)} onCreate={onCreateTag} />
    </aside>
  );
}
