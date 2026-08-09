import { useEffect, useState } from 'react';
import { useAddMember, useListMembers, useRemoveMember } from './queries';
import { ROLES } from '../constants/roles';

export function useShareListModal(listId, open) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState(ROLES.VIEWER);
  const [error, setError] = useState(null);

  const { members, isLoading } = useListMembers(open ? listId : null);
  const addMember = useAddMember(listId);
  const removeMember = useRemoveMember(listId);

  useEffect(() => {
    if (!open) {
      setEmail('');
      setRole(ROLES.VIEWER);
      setError(null);
    }
  }, [open]);

  async function handleInvite(e) {
    e.preventDefault();
    if (!email.trim()) return;
    setError(null);
    try {
      await addMember.mutateAsync({ email: email.trim(), role });
      setEmail('');
    } catch (err) {
      setError(err.response?.data?.error || 'Could not share this list.');
    }
  }

  return {
    email,
    setEmail,
    role,
    setRole,
    error,
    members,
    isLoading,
    isInviting: addMember.isPending,
    handleInvite,
    handleRemove: (userId) => removeMember.mutate(userId),
  };
}
