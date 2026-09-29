import { useEffect, useState } from 'react';
import { TAG_COLORS } from '../constants/tagColors';
import { VISIBILITY } from '../constants/visibility';
import { errorMessage } from '../api/errorMessage';

export function useTagCreateModal(onCreate, open) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(TAG_COLORS[0]);
  const [visibility, setVisibility] = useState(VISIBILITY.PRIVATE);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName('');
    setColor(TAG_COLORS[0]);
    setVisibility(VISIBILITY.PRIVATE);
    setError(null);
  }, [open]);

  async function handleCreate() {
    setError(null);
    setSaving(true);
    try {
      await onCreate(name.trim(), color, visibility);
      return true;
    } catch (err) {
      setError(errorMessage(err, 'Could not create this tag.'));
      return false;
    } finally {
      setSaving(false);
    }
  }

  return { name, setName, color, setColor, visibility, setVisibility, error, saving, handleCreate };
}
