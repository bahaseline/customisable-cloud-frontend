import { Link } from 'react-router-dom';

export default function FileLinkRow({ to, name, meta }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-4 border-b border-grey-100 px-4 py-2.5 hover:bg-grey-50 dark:border-grey-800 dark:hover:bg-grey-850"
    >
      <span className="min-w-0 flex-1 truncate text-sm text-grey-800 dark:text-grey-200">{name}</span>
      {meta && <span className="shrink-0 text-xs text-grey-700 dark:text-grey-500">{meta}</span>}
    </Link>
  );
}
