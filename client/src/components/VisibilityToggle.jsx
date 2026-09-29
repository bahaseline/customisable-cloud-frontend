import { ShareIcon } from './icons';
import { VISIBILITY } from '../constants/visibility';

const SHARED_HINT = "Anyone who can see a file you've tagged with this can see and use the tag too";

// The "Only me / Everyone" switch for a tag. `sharedDisabledReason` greys out
// "Everyone" and explains why; `compact` is the small version used inline
// in the tag picker.
export default function VisibilityToggle({ value, onChange, disabled = false, sharedDisabledReason, compact = false }) {
  const size = compact ? 'px-2.5 py-1' : 'px-3 py-1.5';

  function optionClass(option, blocked) {
    if (blocked) return 'cursor-not-allowed text-[#c7cacd] dark:text-grey-700';
    const state =
      value === option
        ? 'bg-primary text-white'
        : 'text-grey-700 hover:bg-grey-100 dark:text-grey-500 dark:hover:bg-grey-800';
    return `${state} disabled:opacity-50`;
  }

  // preventDefault on mousedown keeps focus where it is, so picking an option
  // doesn't blur (and close) the tag picker's input; click still fires, so
  // the keyboard works too.
  const keepFocus = (e) => e.preventDefault();

  return (
    <div
      className={`flex overflow-hidden rounded-full border border-grey-300 dark:border-grey-700 ${compact ? '' : 'text-sm'}`}
    >
      <button
        type="button"
        disabled={disabled}
        onMouseDown={keepFocus}
        onClick={() => onChange(VISIBILITY.PRIVATE)}
        className={`flex-1 ${size} text-center transition-colors ${optionClass(VISIBILITY.PRIVATE)}`}
      >
        Only me
      </button>
      <button
        type="button"
        disabled={disabled || !!sharedDisabledReason}
        title={sharedDisabledReason || SHARED_HINT}
        onMouseDown={keepFocus}
        onClick={() => onChange(VISIBILITY.SHARED)}
        className={`flex flex-1 items-center justify-center gap-1 ${size} text-center transition-colors ${optionClass(
          VISIBILITY.SHARED,
          !!sharedDisabledReason
        )}`}
      >
        {compact && <ShareIcon className="h-3 w-3 shrink-0" />}
        Everyone
      </button>
    </div>
  );
}
