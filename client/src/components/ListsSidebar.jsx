import { useMemo, useState } from 'react';
import { FolderIcon, TrashIcon, ShareIcon, PencilIcon, ClockIcon, SearchIcon } from './icons';
import ListNameForm from './ListNameForm';
import TagEditModal from './TagEditModal';
import TagCreateModal from './TagCreateModal';
import { useListsSidebar } from '../hooks/useListsSidebar';
import { isOwner } from '../constants/roles';

function SidebarSearch({ value, onChange, placeholder }) {
  return (
    <div className="mb-1 flex items-center gap-2 rounded-full border border-[#dadce0] px-3 py-1 dark:border-[#5f6368]">
      <SearchIcon className="h-3.5 w-3.5 shrink-0 text-[#9aa0a6]" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-xs text-[#202124] placeholder:text-[#9aa0a6] focus:outline-none dark:text-[#e8eaed]"
      />
    </div>
  );
}

function ListRow({ list, active, editing, onSelect, onStartRenaming, onRename, onCancelRename, onShare, onDelete }) {
  if (editing) {
    return (
      <ListNameForm
        inputId={`rename-list-${list.id}`}
        initialValue={list.name}
        submitLabel="Save"
        onSubmit={(name) => onRename(list.id, name)}
        onCancel={onCancelRename}
      />
    );
  }

  return (
    <div
      className={`group relative flex items-center rounded-r-full ${
        active ? 'bg-[#e8f0fe] dark:bg-[#3c4043]' : 'hover:bg-[#f1f3f4] dark:hover:bg-[#292a2d]'
      }`}
    >
      <button
        onClick={() => onSelect(list.id)}
        className={`flex min-w-0 flex-1 items-center gap-3 px-4 py-2 text-left text-sm ${
          active ? 'font-medium text-[#1a73e8]' : 'text-[#3c4043] dark:text-[#e8eaed]'
        }`}
        title={list.name}
      >
        <FolderIcon className={`h-5 w-5 shrink-0 ${active ? 'text-[#1a73e8]' : 'text-[#5f6368] dark:text-[#9aa0a6]'}`} />
        <span className="min-w-0 flex-1 truncate">{list.name}</span>
        {list.isShared && <ShareIcon className="h-3 w-3 shrink-0 text-[#5f6368] dark:text-[#9aa0a6]" />}
      </button>
      {isOwner(list.role) && (
        <div className="absolute right-1 top-1/2 flex -translate-y-1/2 items-center rounded-full bg-inherit opacity-0 group-hover:opacity-100">
          <button
            onClick={() => onStartRenaming(list)}
            aria-label={`Rename ${list.name}`}
            className="rounded-full p-1.5 text-[#9aa0a6] hover:bg-[#e0e0e0] hover:text-[#1a73e8] dark:hover:bg-[#5f6368]"
          >
            <PencilIcon className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onShare(list.id)}
            aria-label={`Share ${list.name}`}
            className="rounded-full p-1.5 text-[#9aa0a6] hover:bg-[#e0e0e0] hover:text-[#1a73e8] dark:hover:bg-[#5f6368]"
          >
            <ShareIcon className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onDelete(list.id)}
            aria-label={`Delete ${list.name}`}
            className="rounded-full p-1.5 text-[#9aa0a6] hover:bg-[#e0e0e0] hover:text-[#d93025] dark:hover:bg-[#5f6368]"
          >
            <TrashIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

function TagRow({ tag, active, currentUserId, onSelectTag, onSaveTag, onDeleteTag }) {
  const [editing, setEditing] = useState(false);
  const canManage = tag.ownerId === currentUserId;

  return (
    <div
      className={`group relative flex items-center gap-4 rounded-r-full px-4 py-2 text-sm ${
        active
          ? 'bg-[#e8f0fe] font-medium text-[#1a73e8] dark:bg-[#3c4043]'
          : 'text-[#3c4043] hover:bg-[#f1f3f4] dark:text-[#e8eaed] dark:hover:bg-[#292a2d]'
      }`}
    >
      <button
        type="button"
        onClick={() => canManage && setEditing(true)}
        aria-label={canManage ? `Edit ${tag.name}` : undefined}
        className={`block h-3.5 w-3.5 shrink-0 rounded-full ${active ? 'ring-2 ring-offset-1 ring-[#1a73e8] dark:ring-offset-[#202124]' : ''}`}
        style={{ backgroundColor: tag.color }}
      />
      <button
        onClick={() => onSelectTag(tag.id)}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
        title={tag.visibility === 'shared' ? `${tag.name} · shared` : tag.name}
      >
        <span className="min-w-0 flex-1 truncate">{tag.name}</span>
        {tag.visibility === 'shared' && (
          <ShareIcon className="h-3 w-3 shrink-0 text-[#5f6368] dark:text-[#9aa0a6]" />
        )}
      </button>
      {canManage && (
        <div className="absolute right-1 top-1/2 flex -translate-y-1/2 items-center rounded-full bg-inherit opacity-0 group-hover:opacity-100">
          <button
            onClick={() => setEditing(true)}
            aria-label={`Edit ${tag.name}`}
            className="rounded-full p-1.5 text-[#9aa0a6] hover:bg-[#e0e0e0] hover:text-[#1a73e8] dark:hover:bg-[#5f6368]"
          >
            <PencilIcon className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onDeleteTag(tag.id)}
            aria-label={`Delete ${tag.name}`}
            className="rounded-full p-1.5 text-[#9aa0a6] hover:bg-[#e0e0e0] hover:text-[#d93025] dark:hover:bg-[#5f6368]"
          >
            <TrashIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
      {canManage && (
        <TagEditModal open={editing} onClose={() => setEditing(false)} tag={tag} onSave={onSaveTag} />
      )}
    </div>
  );
}

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
      className="flex w-60 shrink-0 flex-col overflow-y-auto bg-white px-3 py-4 dark:bg-[#202124]"
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
          className="mb-4 flex w-fit items-center gap-3 rounded-2xl bg-white px-5 py-3.5 text-sm font-medium text-[#3c4043] shadow-[0_1px_3px_1px_rgba(60,64,67,0.15),0_1px_2px_0_rgba(60,64,67,0.3)] hover:shadow-[0_1px_3px_1px_rgba(60,64,67,0.25),0_2px_4px_1px_rgba(60,64,67,0.2)] dark:bg-[#292a2d] dark:text-[#e8eaed]"
        >
          <span className="text-xl leading-none text-[#1a73e8]">+</span>
          New list
        </button>
      )}

      <nav className="flex flex-col gap-0.5">
        <button
          onClick={() => onSelectList(null)}
          className={`flex items-center gap-4 rounded-r-full px-4 py-2 text-left text-sm ${
            activeListId === null && !activeTagId && !frequentActive
              ? 'bg-[#e8f0fe] font-medium text-[#1a73e8] dark:bg-[#3c4043]'
              : 'text-[#3c4043] hover:bg-[#f1f3f4] dark:text-[#e8eaed] dark:hover:bg-[#292a2d]'
          }`}
        >
          <FolderIcon
            className={`h-5 w-5 shrink-0 ${activeListId === null && !activeTagId && !frequentActive ? 'text-[#1a73e8]' : 'text-[#5f6368] dark:text-[#9aa0a6]'}`}
          />
          All Drive Files
        </button>

        <button
          onClick={onSelectFrequent}
          className={`flex items-center gap-4 rounded-r-full px-4 py-2 text-left text-sm ${
            frequentActive
              ? 'bg-[#e8f0fe] font-medium text-[#1a73e8] dark:bg-[#3c4043]'
              : 'text-[#3c4043] hover:bg-[#f1f3f4] dark:text-[#e8eaed] dark:hover:bg-[#292a2d]'
          }`}
        >
          <ClockIcon
            className={`h-5 w-5 shrink-0 ${frequentActive ? 'text-[#1a73e8]' : 'text-[#5f6368] dark:text-[#9aa0a6]'}`}
          />
          Frequently used
        </button>

        {ownedLists.length > 0 && (
          <p className="mb-1 mt-4 px-4 text-xs font-medium uppercase tracking-wide text-[#80868b] dark:text-[#9aa0a6]">
            My Lists
          </p>
        )}

        {ownedLists.length > 4 && (
          <div className="px-4">
            <SidebarSearch value={listQuery} onChange={setListQuery} placeholder="Search lists…" />
          </div>
        )}

        {visibleLists.length === 0 && listQuery && (
          <p className="px-4 py-2 text-xs text-[#9aa0a6]">No lists match &ldquo;{listQuery}&rdquo;.</p>
        )}

        {visibleLists.map((list) => (
          <ListRow
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
          <p className="mb-1 mt-4 px-4 text-xs font-medium uppercase tracking-wide text-[#80868b] dark:text-[#9aa0a6]">
            Shared with me
          </p>
        )}

        {sharedLists.length > 0 && (
          <div className="px-4">
            <SidebarSearch value={sharedQuery} onChange={setSharedQuery} placeholder="Search shared lists…" />
          </div>
        )}

        {visibleSharedLists.length === 0 && sharedQuery && (
          <p className="px-4 py-2 text-xs text-[#9aa0a6]">No lists match &ldquo;{sharedQuery}&rdquo;.</p>
        )}

        {visibleSharedLists.map((list) => (
          <ListRow key={list.id} list={list} active={activeListId === list.id} onSelect={onSelectList} />
        ))}

        {tags && (
          <div className="mb-1 mt-4 flex items-center justify-between px-4">
            <p className="text-xs font-medium uppercase tracking-wide text-[#80868b] dark:text-[#9aa0a6]">Tags</p>
            <button
              onClick={() => setCreatingTag(true)}
              aria-label="New tag"
              className="rounded-full p-1 text-[#9aa0a6] hover:bg-[#f1f3f4] hover:text-[#1a73e8] dark:hover:bg-[#3c4043]"
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
          <p className="px-4 py-2 text-xs text-[#9aa0a6]">No tags yet - create one to get started.</p>
        )}

        {tags && visibleTags.length === 0 && tagQuery && (
          <p className="px-4 py-2 text-xs text-[#9aa0a6]">No tags match &ldquo;{tagQuery}&rdquo;.</p>
        )}

        {visibleTags.map((tag) => (
          <TagRow
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
