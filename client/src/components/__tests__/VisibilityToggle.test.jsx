import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import VisibilityToggle from '../VisibilityToggle';
import { VISIBILITY } from '../../constants/visibility';

const onlyMe = () => screen.getByRole('button', { name: /only me/i });
const everyone = () => screen.getByRole('button', { name: /everyone/i });

describe('VisibilityToggle', () => {
  it('reports the option the user picks', async () => {
    const onChange = vi.fn();
    render(<VisibilityToggle value={VISIBILITY.PRIVATE} onChange={onChange} />);

    await userEvent.click(everyone());
    expect(onChange).toHaveBeenCalledWith(VISIBILITY.SHARED);

    await userEvent.click(onlyMe());
    expect(onChange).toHaveBeenCalledWith(VISIBILITY.PRIVATE);
  });

  // A viewer cannot share a tag onto a list they can only read, so the option
  // is blocked and says why rather than silently failing on the server.
  it('blocks sharing and gives the reason when one is supplied', () => {
    render(
      <VisibilityToggle
        value={VISIBILITY.PRIVATE}
        onChange={vi.fn()}
        sharedDisabledReason="You can only view this list"
      />
    );

    expect(everyone()).toBeDisabled();
    expect(everyone()).toHaveAttribute('title', 'You can only view this list');
    expect(onlyMe()).toBeEnabled();
  });

  it('disables both options when the whole control is disabled', () => {
    render(<VisibilityToggle value={VISIBILITY.PRIVATE} onChange={vi.fn()} disabled />);
    expect(onlyMe()).toBeDisabled();
    expect(everyone()).toBeDisabled();
  });

  // Picking an option must not blur the tag picker's input, or the picker
  // would close before the choice registered.
  it('keeps focus where it is when an option is pressed', async () => {
    render(
      <>
        <input data-testid="picker" />
        <VisibilityToggle value={VISIBILITY.PRIVATE} onChange={vi.fn()} />
      </>
    );

    const input = screen.getByTestId('picker');
    input.focus();
    await userEvent.click(everyone());

    expect(input).toHaveFocus();
  });
});
