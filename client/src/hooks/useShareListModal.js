import { useEffect, useState } from 'react';
import { useAddMember, useListMembers, useRemoveMember } from './queries';
import { ROLES } from '../constants/roles';
import { useConfirm } from '../context/ConfirmContext';
import { useToast } from '../context/ToastContext';

export function useShareListModal(listId, open) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState(ROLES.VIEWER);
  const [error, setError] = useState(null);
  const confirm = useConfirm();
  const { showToast } = useToast();

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
    handleChangeRole: async (memberEmail, newRole) => {
      try {
        await addMember.mutateAsync({ email: memberEmail, role: newRole });
      } catch (err) {
        showToast(err.response?.data?.error || 'Could not change this person’s access.');
      }
    },
    handleRemove: async (userId) => {
      const member = members.find((m) => m.userId === userId);
      const confirmed = await confirm({
        title: 'Remove access?',
        message: `${member?.email} will no longer be able to open this list.`,
        confirmLabel: 'Remove',
        destructive: true,
      });
      if (confirmed) removeMember.mutate(userId);
    },
  };
}
