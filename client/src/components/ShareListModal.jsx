import { XIcon } from './icons';
import Modal from './Modal';
import Spinner from './Spinner';
import { useShareListModal } from '../hooks/useShareListModal';
import { ROLE_LABELS, isOwner } from '../constants/roles';

function MemberRow({ member, onRemove }) {
  return (
    <li className="flex items-center gap-3 px-1 py-2">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1a73e8] text-xs font-medium text-white">
        {(member.name || member.email).charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-[#202124] dark:text-[#e8eaed]">{member.name || member.email}</p>
        <p className="truncate text-xs text-[#5f6368] dark:text-[#9aa0a6]">{member.email}</p>
      </div>
      <span className="shrink-0 text-xs text-[#5f6368] dark:text-[#9aa0a6]">{ROLE_LABELS[member.role]}</span>
      {!isOwner(member.role) && (
        <button
          onClick={() => onRemove(member.userId)}
          aria-label={`Remove ${member.email}`}
          className="shrink-0 rounded-full p-1 text-[#5f6368] hover:bg-[#f1f3f4] hover:text-[#d93025] dark:text-[#9aa0a6] dark:hover:bg-[#3c4043]"
        >
          <XIcon className="h-4 w-4" />
        </button>
      )}
    </li>
  );
}

export default function ShareListModal({ open, onClose, listId, listName }) {
  const { email, setEmail, role, setRole, error, members, isLoading, isInviting, handleInvite, handleRemove } =
    useShareListModal(listId, open);

  const title = (
    <h2 className="min-w-0 flex-1 truncate text-base font-medium text-[#202124] dark:text-[#e8eaed]">
      Share “{listName}”
    </h2>
  );

  return (
    <Modal open={open} onClose={onClose} header={title} maxWidth="max-w-md">
      <form onSubmit={handleInvite} className="flex flex-col gap-2 px-5 py-4">
        <div className="flex gap-2">
          <input
            id="share-invite-email"
            name="email"
            autoComplete="email"
            autoFocus
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Add people by email"
            className="min-w-0 flex-1 rounded-lg border border-[#dadce0] px-3 py-2 text-sm focus:border-[#1a73e8] focus:outline-none dark:border-[#5f6368] dark:bg-[#202124] dark:text-[#e8eaed]"
          />
          <select
            id="share-invite-role"
            name="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            aria-label="Access level"
            className="shrink-0 rounded-lg border border-[#dadce0] px-2 py-2 text-sm text-[#3c4043] focus:border-[#1a73e8] focus:outline-none dark:border-[#5f6368] dark:bg-[#202124] dark:text-[#e8eaed]"
          >
            <option value="viewer">Can view</option>
            <option value="editor">Can edit</option>
          </select>
        </div>

        {error && <p className="text-xs text-[#d93025] dark:text-[#f28b82]">{error}</p>}

        <button
          type="submit"
          disabled={!email.trim() || isInviting}
          className="self-end rounded-full bg-[#1a73e8] px-4 py-1.5 text-sm font-medium text-white hover:bg-[#1765cc] disabled:opacity-50"
        >
          {isInviting ? 'Sharing…' : 'Share'}
        </button>
      </form>

      <div className="flex-1 overflow-y-auto border-t border-[#e0e0e0] px-4 py-3 dark:border-[#3c4043]">
        <p className="mb-1 px-1 text-xs font-medium uppercase tracking-wide text-[#80868b] dark:text-[#9aa0a6]">
          People with access
        </p>
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Spinner size="sm" />
          </div>
        ) : (
          <ul>
            {members.map((member) => (
              <MemberRow key={member.userId} member={member} onRemove={handleRemove} />
            ))}
          </ul>
        )}
      </div>
    </Modal>
  );
}
