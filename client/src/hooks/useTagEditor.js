import { useState } from 'react';
import { TAG_COLORS } from '../components/tagColors';

export function useTagEditor(item, allTags, onAttach, onCreateTag) {
  const [adding, setAdding] = useState(false);
  const [query, setQuery] = useState('');
  const [color, setColor] = useState(TAG_COLORS[0]);

  const attachedIds = new Set(item.tags.map((t) => t.id));
  const suggestions = allTags.filter(
    (t) => !attachedIds.has(t.id) && t.name.toLowerCase().includes(query.toLowerCase())
  );
  const exactMatch = allTags.some((t) => t.name.toLowerCase() === query.trim().toLowerCase());

  async function handleSelect(tag) {
    await onAttach(item.id, tag);
    setQuery('');
    setAdding(false);
  }

  async function handleCreateAndAttach(e) {
    e.preventDefault();
    if (!query.trim()) return;
    const tag = await onCreateTag(query.trim(), color);
    await onAttach(item.id, tag);
    setQuery('');
    setColor(TAG_COLORS[0]);
    setAdding(false);
  }

  function handlePickColor(e, c) {
    e.preventDefault();
    setColor(c);
  }

  function handleBlur() {
    setTimeout(() => setAdding(false), 150);
  }

  return {
    adding,
    setAdding,
    query,
    setQuery,
    color,
    suggestions,
    exactMatch,
    handleSelect,
    handleCreateAndAttach,
    handlePickColor,
    handleBlur,
  };
}
