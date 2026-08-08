export default function EmptyState({ message, className = 'py-12' }) {
  return <p className={`text-center text-sm text-[#5f6368] dark:text-[#9aa0a6] ${className}`}>{message}</p>;
}
