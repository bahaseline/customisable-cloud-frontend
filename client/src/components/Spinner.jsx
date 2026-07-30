export default function Spinner({ size = 'md' }) {
  const dimensions = size === 'sm' ? 'h-5 w-5' : 'h-8 w-8';
  return (
    <div
      className={`animate-spin rounded-full border-2 border-[#dadce0] border-t-[#1a73e8] dark:border-[#3c4043] ${dimensions}`}
    />
  );
}
