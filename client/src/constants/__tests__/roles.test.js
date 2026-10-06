import { describe, it, expect } from 'vitest';
import { ROLES, canEdit, isOwner } from '../roles';

// A list the user has no membership on resolves to no role at all. The
// absent cases matter most: they must never read as access.
describe('canEdit', () => {
  it.each([
    [ROLES.OWNER, true],
    [ROLES.EDITOR, true],
    [ROLES.VIEWER, false],
    [undefined, false],
    [null, false],
  ])('%s -> %s', (role, expected) => {
    expect(canEdit(role)).toBe(expected);
  });
});

describe('isOwner', () => {
  it.each([
    [ROLES.OWNER, true],
    [ROLES.EDITOR, false],
    [ROLES.VIEWER, false],
    [undefined, false],
  ])('%s -> %s', (role, expected) => {
    expect(isOwner(role)).toBe(expected);
  });
});
