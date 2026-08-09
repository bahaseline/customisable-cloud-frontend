export const ROLES = { OWNER: 'owner', EDITOR: 'editor', VIEWER: 'viewer' };

export const ROLE_LABELS = {
  [ROLES.OWNER]: 'Owner',
  [ROLES.EDITOR]: 'Can edit',
  [ROLES.VIEWER]: 'Can view',
};

// Shown on the badge that tells a member how much access they have.
export const ACCESS_HINTS = {
  [ROLES.EDITOR]: 'can edit',
  [ROLES.VIEWER]: 'view only',
};

export const canEdit = (role) => role === ROLES.OWNER || role === ROLES.EDITOR;
export const isOwner = (role) => role === ROLES.OWNER;
