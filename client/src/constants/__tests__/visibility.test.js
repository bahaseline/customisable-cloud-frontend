import { describe, it, expect } from 'vitest';
import { VISIBILITY, isShared } from '../visibility';

// A tag shaped by a partial response, or created before visibility existed,
// must default to private rather than leaking to other list members.
describe('isShared', () => {
  it.each([
    [{ visibility: VISIBILITY.SHARED }, true],
    [{ visibility: VISIBILITY.PRIVATE }, false],
    [{}, false],
  ])('%o -> %s', (tag, expected) => {
    expect(isShared(tag)).toBe(expected);
  });
});
