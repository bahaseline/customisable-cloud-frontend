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
