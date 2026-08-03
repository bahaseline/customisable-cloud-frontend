import { useEffect, useMemo, useState } from 'react';

export function useAddFileModal(open, onClose, files) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    if (open) document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  const visibleFiles = useMemo(
    () => files.filter((f) => f.name.toLowerCase().includes(query.toLowerCase())),
    [files, query]
  );

  return { query, setQuery, visibleFiles };
}
