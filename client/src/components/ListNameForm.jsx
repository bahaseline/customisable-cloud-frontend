import { useState } from 'react';

// A form for creating or renaming a list. The parent component controls whether
// the form is open and what happens on submit or cancel. The form itself controls
// the text being typed.
export default function ListNameForm({
  inputId,
  initialValue = '',
  submitLabel,
  onSubmit,
  onCancel,
  cancelOnBlur = false,
}) {
  const [value, setValue] = useState(initialValue);

  function handleSubmit(e) {
    e.preventDefault();
    const name = value.trim();
    if (!name) return;
    onSubmit(name);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-2 flex flex-col gap-2 rounded-2xl border border-grey-300 p-2 shadow-sm dark:border-grey-700"
    >
      <input
        id={inputId}
        name="listName"
        autoComplete="off"
        autoFocus
        type="text"
        placeholder="List name"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => cancelOnBlur && !value && onCancel()}
        className="rounded border border-grey-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none dark:border-grey-700 dark:bg-grey-850 dark:text-grey-200"
      />
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded px-3 py-1 text-xs font-medium text-grey-700 hover:bg-grey-100 dark:text-grey-500 dark:hover:bg-grey-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded px-3 py-1 text-xs font-medium text-primary hover:bg-[#eaf1fb] dark:hover:bg-grey-800"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
