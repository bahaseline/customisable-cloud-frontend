import { useState } from 'react';
import { TAG_COLORS } from '../components/tagColors';

export function useTagEditor(item, allTags, onAttach, onCreateTag) {
  const [adding, setAdding] = useState(false);
  const [query, setQuery] = useState('');
  const [color, setColor] = useState(TAG_COLORS[0]);
  const [highlight, setHighlight] = useState(-1);

  const attachedIds = new Set(item.tags.map((t) => t.id));
  const suggestions = allTags.filter(
    (t) => !attachedIds.has(t.id) && t.name.toLowerCase().includes(query.trim().toLowerCase())
  );
  const exactMatch = allTags.find((t) => t.name.toLowerCase() === query.trim().toLowerCase());

  function reset() {
    setQuery('');
    setColor(TAG_COLORS[0]);
    setHighlight(-1);
    setAdding(false);
  }

  function updateQuery(value) {
    setQuery(value);
    setHighlight(-1);
  }

  async function handleSelect(tag) {
    try {
      await onAttach(item.id, tag);
      reset();
    } catch {
      return;
    }
  }

  async function handleCreateAndAttach(e) {
    e.preventDefault();
    const name = query.trim();
    if (!name) return;

    try {
      if (exactMatch) {
        if (!attachedIds.has(exactMatch.id)) await onAttach(item.id, exactMatch);
      } else {
        const tag = await onCreateTag(name, color);
        await onAttach(item.id, tag);
      }
      reset();
    } catch {
      return;
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Escape') {
      e.preventDefault();
      reset();
    } else if (e.key === 'Enter' && highlight >= 0 && suggestions[highlight]) {
      // Otherwise fall through and let the form submit (create/attach by name).
      e.preventDefault();
      handleSelect(suggestions[highlight]);
    }
  }

  function handlePickColor(e, c) {
    e.preventDefault();
    setColor(c);
  }

  function handleBlur() {
    setTimeout(reset, 150);
  }

  return {
    adding,
    setAdding,
    query,
    setQuery: updateQuery,
    color,
    highlight,
    setHighlight,
    suggestions,
    exactMatch,
    canCreate: !!query.trim() && !exactMatch,
    handleSelect,
    handleCreateAndAttach,
    handleKeyDown,
    handlePickColor,
    handleBlur,
  };
}
