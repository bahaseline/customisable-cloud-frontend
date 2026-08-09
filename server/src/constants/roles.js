// Single source of truth for the list-sharing role vocabulary.
const ROLES = { OWNER: 'owner', EDITOR: 'editor', VIEWER: 'viewer' };

const ROLE_RANK = {
  [ROLES.VIEWER]: 1,
  [ROLES.EDITOR]: 2,
  [ROLES.OWNER]: 3,
};

const ASSIGNABLE_ROLES = [ROLES.VIEWER, ROLES.EDITOR];

function satisfies(role, minRole) {
  return (ROLE_RANK[role] ?? 0) >= ROLE_RANK[minRole];
}

module.exports = { ROLES, ASSIGNABLE_ROLES, satisfies };
