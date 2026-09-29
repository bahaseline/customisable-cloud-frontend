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

  // The visibility toggle looks like an instant switch, so it saves the
  // moment it's clicked instead of waiting for the separate Save button
  async function handleVisibilityChange(newVisibility) {
    const previous = visibility;
    setVisibility(newVisibility);
    setError(null);
    setSaving(true);
    try {
      await onSave(tag.id, { color, visibility: newVisibility });
    } catch (err) {
      setVisibility(previous);
      setError(err.response?.data?.error || 'Could not change who can see this tag.');
    } finally {
      setSaving(false);
    }
  }

  return { color, setColor, visibility, error, saving, handleSave, handleVisibilityChange };
}
