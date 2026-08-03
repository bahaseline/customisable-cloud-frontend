import { useState } from 'react';

export function useListsSidebar(onCreateList) {
  const [creating, setCreating] = useState(false);
  const [newListName, setNewListName] = useState('');

  function startCreating() {
    setCreating(true);
  }

  function cancelCreating() {
    setCreating(false);
  }

  function handleBlur() {
    if (!newListName) setCreating(false);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!newListName.trim()) return;
    onCreateList(newListName.trim());
    setNewListName('');
    setCreating(false);
  }

  return { creating, newListName, setNewListName, startCreating, cancelCreating, handleBlur, handleSubmit };
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
