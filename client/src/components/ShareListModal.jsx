import { XIcon } from './icons';
import Modal from './Modal';
import Spinner from './Spinner';
import { useShareListModal } from '../hooks/useShareListModal';
import { ROLE_LABELS, isOwner } from '../constants/roles';

function MemberRow({ member, onChangeRole, onRemove }) {
  return (
    <li className="flex items-center gap-3 px-1 py-2">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-white">
        {(member.name || member.email).charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-grey-900 dark:text-grey-200">{member.name || member.email}</p>
        <p className="truncate text-xs text-grey-700 dark:text-grey-500">{member.email}</p>
      </div>
      {isOwner(member.role) ? (
        <span className="shrink-0 text-xs text-grey-700 dark:text-grey-500">{ROLE_LABELS[member.role]}</span>
      ) : (
        <select
          value={member.role}
          onChange={(e) => onChangeRole(member.userId, e.target.value)}
          aria-label={`Access level for ${member.email}`}
          className="shrink-0 rounded-lg border border-grey-300 px-2 py-1 text-xs text-grey-800 focus:border-primary focus:outline-none dark:border-grey-700 dark:bg-grey-900 dark:text-grey-200"
        >
          <option value="viewer">Can view</option>
          <option value="editor">Can edit</option>
        </select>
      )}
      {!isOwner(member.role) && (
        <button
          onClick={() => onRemove(member.userId)}
          aria-label={`Remove ${member.email}`}
          className="shrink-0 rounded-full p-1 text-grey-700 hover:bg-grey-100 hover:text-danger dark:text-grey-500 dark:hover:bg-grey-800"
        >
          <XIcon className="h-4 w-4" />
        </button>
      )}
    </li>
  );
}

export default function ShareListModal({ open, onClose, listId, listName }) {
  const {
    email,
    setEmail,
    role,
    setRole,
    error,
    members,
    isLoading,
    isInviting,
    handleInvite,
    handleChangeRole,
    handleRemove,
  } = useShareListModal(listId, open);

  const title = (
    <h2 className="min-w-0 flex-1 truncate text-base font-medium text-grey-900 dark:text-grey-200">
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
            className="min-w-0 flex-1 rounded-lg border border-grey-300 px-3 py-2 text-sm focus:border-primary focus:outline-none dark:border-grey-700 dark:bg-grey-900 dark:text-grey-200"
          />
          <select
            id="share-invite-role"
            name="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            aria-label="Access level"
            className="shrink-0 rounded-lg border border-grey-300 px-2 py-2 text-sm text-grey-800 focus:border-primary focus:outline-none dark:border-grey-700 dark:bg-grey-900 dark:text-grey-200"
          >
            <option value="viewer">Can view</option>
            <option value="editor">Can edit</option>
          </select>
        </div>

        {error && <p className="text-xs text-danger dark:text-danger-light">{error}</p>}

        <button
          type="submit"
          disabled={!email.trim() || isInviting}
          className="self-end rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50"
        >
          {isInviting ? 'Sharing…' : 'Share'}
        </button>
      </form>

      <div className="flex-1 overflow-y-auto border-t border-grey-250 px-4 py-3 dark:border-grey-800">
        <p className="mb-1 px-1 text-xs font-medium uppercase tracking-wide text-grey-600 dark:text-grey-500">
          People with access
        </p>
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Spinner size="sm" />
          </div>
        ) : (
          <ul>
            {members.map((member) => (
              <MemberRow
                key={member.userId}
                member={member}
                onChangeRole={handleChangeRole}
                onRemove={handleRemove}
              />
            ))}
          </ul>
        )}
      </div>
    </Modal>
  );
}
