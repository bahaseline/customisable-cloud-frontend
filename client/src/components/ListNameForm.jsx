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
      className="mb-2 flex flex-col gap-2 rounded-2xl border border-[#dadce0] p-2 shadow-sm dark:border-[#5f6368]"
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
        className="rounded border border-[#dadce0] px-2 py-1.5 text-sm focus:border-[#1a73e8] focus:outline-none dark:border-[#5f6368] dark:bg-[#292a2d] dark:text-[#e8eaed]"
      />
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded px-3 py-1 text-xs font-medium text-[#5f6368] hover:bg-[#f1f3f4] dark:text-[#9aa0a6] dark:hover:bg-[#3c4043]"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded px-3 py-1 text-xs font-medium text-[#1a73e8] hover:bg-[#eaf1fb] dark:hover:bg-[#3c4043]"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
