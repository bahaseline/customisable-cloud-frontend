import { FolderIcon, TrashIcon, ShareIcon } from './icons';
import { TAG_COLORS } from './tagColors';
import ColorSwatchPicker from './ColorSwatchPicker';
import { useListsSidebar, useTagDot } from '../hooks/useListsSidebar';
import { isOwner } from '../constants/roles';

function TagDot({ tag, active, onChangeColor }) {
  const { open, toggle, pickColor } = useTagDot(tag, onChangeColor);

  return (
    <span className="relative shrink-0">
      <button
        type="button"
        onClick={toggle}
        aria-label={`Change color for ${tag.name}`}
        className={`block h-3.5 w-3.5 rounded-full ${active ? 'ring-2 ring-offset-1 ring-[#1a73e8] dark:ring-offset-[#202124]' : ''}`}
        style={{ backgroundColor: tag.color }}
      />
      {open && (
        <div
          className="absolute left-0 top-full z-20 mt-1 w-28 rounded-lg border border-[#dadce0] bg-white p-2 shadow-lg dark:border-[#5f6368] dark:bg-[#292a2d]"
          onClick={(e) => e.stopPropagation()}
        >
          <ColorSwatchPicker
            colors={TAG_COLORS}
            selectedColor={tag.color}
            onPick={(_e, c) => pickColor(c)}
          />
        </div>
      )}
    </span>
  );
}

export default function ListsSidebar({
  lists,
  activeListId,
  onSelectList,
  onCreateList,
  onDeleteList,
  onShareList,
  tags,
  activeTagId,
  onSelectTag,
  onChangeTagColor,
}) {
  const { creating, newListName, setNewListName, startCreating, cancelCreating, handleBlur, handleSubmit } =
    useListsSidebar(onCreateList);

  return (
    <aside className="flex w-52 shrink-0 flex-col overflow-y-auto bg-white px-3 py-4 dark:bg-[#202124]">
      {creating ? (
        <form onSubmit={handleSubmit} className="mb-3 flex flex-col gap-2 rounded-2xl border border-[#dadce0] p-3 shadow-sm dark:border-[#5f6368]">
          <input
            id="new-list-name"
            name="listName"
            autoComplete="off"
            autoFocus
            type="text"
            placeholder="List name"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            onBlur={handleBlur}
            className="rounded border border-[#dadce0] px-2 py-1.5 text-sm focus:border-[#1a73e8] focus:outline-none dark:border-[#5f6368] dark:bg-[#292a2d] dark:text-[#e8eaed]"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={cancelCreating}
              className="rounded px-3 py-1 text-xs font-medium text-[#5f6368] hover:bg-[#f1f3f4] dark:text-[#9aa0a6] dark:hover:bg-[#3c4043]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded px-3 py-1 text-xs font-medium text-[#1a73e8] hover:bg-[#eaf1fb] dark:hover:bg-[#3c4043]"
            >
              Create
            </button>
          </div>
        </form>
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
            activeListId === null && !activeTagId
              ? 'bg-[#e8f0fe] font-medium text-[#1a73e8] dark:bg-[#3c4043]'
              : 'text-[#3c4043] hover:bg-[#f1f3f4] dark:text-[#e8eaed] dark:hover:bg-[#292a2d]'
          }`}
        >
          <FolderIcon
            className={`h-5 w-5 shrink-0 ${activeListId === null && !activeTagId ? 'text-[#1a73e8]' : 'text-[#5f6368] dark:text-[#9aa0a6]'}`}
          />
          All Drive Files
        </button>

        {lists.length > 0 && (
          <p className="mb-1 mt-4 px-4 text-xs font-medium uppercase tracking-wide text-[#80868b] dark:text-[#9aa0a6]">
            My Lists
          </p>
        )}

        {lists.map((list) => (
          <div
            key={list.id}
            className={`group flex items-center rounded-r-full pr-1 ${
              activeListId === list.id ? 'bg-[#e8f0fe] dark:bg-[#3c4043]' : 'hover:bg-[#f1f3f4] dark:hover:bg-[#292a2d]'
            }`}
          >
            <button
              onClick={() => onSelectList(list.id)}
              className={`flex min-w-0 flex-1 items-center gap-4 px-4 py-2 text-left text-sm ${
                activeListId === list.id ? 'font-medium text-[#1a73e8]' : 'text-[#3c4043] dark:text-[#e8eaed]'
              }`}
              title={list.name}
            >
              <FolderIcon className={`h-5 w-5 shrink-0 ${activeListId === list.id ? 'text-[#1a73e8]' : 'text-[#5f6368] dark:text-[#9aa0a6]'}`} />
              <span className="truncate">{list.name}</span>
              {list.isShared && (
                <ShareIcon className="h-3 w-3 shrink-0 text-[#5f6368] dark:text-[#9aa0a6]" />
              )}
            </button>
            {isOwner(list.role) && (
              <>
                <button
                  onClick={() => onShareList(list.id)}
                  aria-label={`Share ${list.name}`}
                  className="shrink-0 rounded-full p-1.5 text-[#9aa0a6] opacity-0 hover:bg-[#e0e0e0] hover:text-[#1a73e8] group-hover:opacity-100 dark:hover:bg-[#5f6368]"
                >
                  <ShareIcon className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => onDeleteList(list.id)}
                  aria-label={`Delete ${list.name}`}
                  className="shrink-0 rounded-full p-1.5 text-[#9aa0a6] opacity-0 hover:bg-[#e0e0e0] hover:text-[#d93025] group-hover:opacity-100 dark:hover:bg-[#5f6368]"
                >
                  <TrashIcon className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </div>
        ))}

        {tags && tags.length > 0 && (
          <p className="mb-1 mt-4 px-4 text-xs font-medium uppercase tracking-wide text-[#80868b] dark:text-[#9aa0a6]">
            Labels
          </p>
        )}

        {tags &&
          tags.map((tag) => (
            <div
              key={tag.id}
              className={`flex items-center gap-4 rounded-r-full px-4 py-2 text-sm ${
                activeTagId === tag.id
                  ? 'bg-[#e8f0fe] font-medium text-[#1a73e8] dark:bg-[#3c4043]'
                  : 'text-[#3c4043] hover:bg-[#f1f3f4] dark:text-[#e8eaed] dark:hover:bg-[#292a2d]'
              }`}
            >
              <TagDot tag={tag} active={activeTagId === tag.id} onChangeColor={onChangeTagColor} />
              <button
                onClick={() => onSelectTag(tag.id)}
                className="min-w-0 flex-1 truncate text-left"
                title={tag.name}
              >
                {tag.name}
              </button>
            </div>
          ))}
      </nav>
    </aside>
  );
}
