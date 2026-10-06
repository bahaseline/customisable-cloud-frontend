import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useEscapeKey } from '../useEscapeKey';

function pressKey(key) {
  document.dispatchEvent(new KeyboardEvent('keydown', { key }));
}

describe('useEscapeKey', () => {
  it('runs the handler on Escape while active', () => {
    const onEscape = vi.fn();
    renderHook(() => useEscapeKey(true, onEscape));

    pressKey('Escape');
    expect(onEscape).toHaveBeenCalledTimes(1);
  });

  it('ignores every other key', () => {
    const onEscape = vi.fn();
    renderHook(() => useEscapeKey(true, onEscape));

    pressKey('Enter');
    pressKey('a');
    expect(onEscape).not.toHaveBeenCalled();
  });

  it('stays quiet while inactive', () => {
    const onEscape = vi.fn();
    renderHook(() => useEscapeKey(false, onEscape));

    pressKey('Escape');
    expect(onEscape).not.toHaveBeenCalled();
  });

  it('starts listening when it becomes active', () => {
    const onEscape = vi.fn();
    const { rerender } = renderHook(({ active }) => useEscapeKey(active, onEscape), {
      initialProps: { active: false },
    });

    pressKey('Escape');
    expect(onEscape).not.toHaveBeenCalled();

    rerender({ active: true });
    pressKey('Escape');
    expect(onEscape).toHaveBeenCalledTimes(1);
  });

  // Without the cleanup, every modal ever opened would keep responding to
  // Escape for the rest of the session.
  it('stops listening once unmounted', () => {
    const onEscape = vi.fn();
    const { unmount } = renderHook(() => useEscapeKey(true, onEscape));

    unmount();
    pressKey('Escape');
    expect(onEscape).not.toHaveBeenCalled();
  });
});
