import { useEffect } from 'react';

// Closes a dismissible surface on Escape while it is active.
export function useEscapeKey(active, onEscape) {
  useEffect(() => {
    if (!active) return undefined;
    function handleKeyDown(e) {
      if (e.key === 'Escape') onEscape();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [active, onEscape]);
}
