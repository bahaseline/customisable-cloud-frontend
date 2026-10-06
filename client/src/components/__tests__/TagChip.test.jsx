import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TagChip from '../TagChip';
import { VISIBILITY } from '../../constants/visibility';

const privateTag = { id: 't1', name: 'Urgent', color: '#d93025', visibility: VISIBILITY.PRIVATE };
const sharedTag = { ...privateTag, id: 't2', name: 'Team', visibility: VISIBILITY.SHARED };

describe('TagChip', () => {
  it('offers no remove button unless a handler is given', () => {
    render(<TagChip tag={privateTag} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  // The label names the tag so a screen reader user can tell several chips
  // on the same row apart.
  it('labels the remove button with the tag it removes', async () => {
    const onRemove = vi.fn();
    render(<TagChip tag={privateTag} onRemove={onRemove} />);

    await userEvent.click(screen.getByRole('button', { name: 'Remove tag Urgent' }));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  // Whether a tag is visible to other members is the one thing the chip has
  // to communicate beyond its name, so the marker carries a name of its own
  // rather than being a decorative icon.
  it('marks a shared tag, and only a shared tag, as shared', () => {
    const { rerender } = render(<TagChip tag={privateTag} />);
    expect(screen.queryByLabelText('Shared tag')).not.toBeInTheDocument();

    rerender(<TagChip tag={sharedTag} />);
    expect(screen.getByLabelText('Shared tag')).toBeInTheDocument();
  });
});
