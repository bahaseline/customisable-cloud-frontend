import { useState } from 'react';

export function useListsSidebar() {
  const [editing, setEditing] = useState(null);

  return {
    editing,
    startCreating: () => setEditing('new'),
    startRenaming: (list) => setEditing(list.id),
    stopEditing: () => setEditing(null),
  };
}

export function useTagDot(tag, onChangeColor) {
  const [open, setOpen] = useState(false);

  function toggle(e) {
    e.stopPropagation();
    setOpen((prev) => !prev);
  }

  function pickColor(c) {
    onChangeColor(tag.id, c);
    setOpen(false);
  }

  return { open, toggle, pickColor };
}
