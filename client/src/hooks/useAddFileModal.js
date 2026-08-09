import { useEffect, useMemo, useState } from 'react';

export function useAddFileModal(open, files) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  const visibleFiles = useMemo(
    () => files.filter((f) => f.name.toLowerCase().includes(query.toLowerCase())),
    [files, query]
  );

  return { query, setQuery, visibleFiles };
}
