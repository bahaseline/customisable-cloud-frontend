export default function EmptyState({ message, className = 'py-12' }) {
  return <p className={`text-center text-sm text-grey-700 dark:text-grey-500 ${className}`}>{message}</p>;
}
