import { useEffect, useRef, useState } from 'react';

export function useTagEditModal(tag, onSave, open) {
  const [color, setColor] = useState('#1a73e8');
  const [visibility, setVisibility] = useState('private');
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const wasOpen = useRef(false);

  // Re-seed on every open (not just the first time for a given tag), so a
  // colour changed elsewhere since the last time you had this open is
  // reflected instead of stale local state.
  useEffect(() => {
    if (open && !wasOpen.current && tag) {
      setColor(tag.color);
      setVisibility(tag.visibility);
      setError(null);
    }
    wasOpen.current = open;
  }, [open, tag]);

  async function handleSave() {
    setError(null);
    setSaving(true);
    try {
      await onSave(tag.id, { color, visibility });
      return true;
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save this tag.');
      return false;
    } finally {
      setSaving(false);
    }
  }

  return { color, setColor, visibility, setVisibility, error, saving, handleSave };
}
