import { ShareIcon, XIcon } from './icons';
import { isShared } from '../constants/visibility';

export default function TagChip({ tag, onRemove }) {
  return (
    <span
      style={{ backgroundColor: `${tag.color}22`, color: tag.color }}
      className="flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs"
    >
      {isShared(tag) && (
        <span role="img" aria-label="Shared tag" className="flex">
          <ShareIcon className="h-2.5 w-2.5 shrink-0" />
        </span>
      )}
      {tag.name}
      {onRemove && (
        <button onClick={onRemove} aria-label={`Remove tag ${tag.name}`} className="rounded-full hover:opacity-70">
          <XIcon className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}
