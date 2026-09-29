export default function Spinner({ size = 'md' }) {
  const dimensions = size === 'sm' ? 'h-5 w-5' : 'h-8 w-8';
  return (
    <div
      className={`animate-spin rounded-full border-2 border-grey-300 border-t-primary dark:border-grey-800 ${dimensions}`}
    />
  );
}
