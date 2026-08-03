import { useEffect, useRef, useState } from 'react';

export function useFilterDropdown(onSelectList, onSelectTag) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function toggle() {
    setOpen((prev) => !prev);
  }

  function selectList(listId) {
    onSelectList(listId);
    setOpen(false);
  }

  function selectTag(tagId) {
    onSelectTag(tagId);
    setOpen(false);
  }

  return { open, containerRef, toggle, selectList, selectTag };
}
