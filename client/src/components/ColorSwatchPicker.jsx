export default function ColorSwatchPicker({ colors, selectedColor, onPick }) {
  return (
    <div className="flex flex-wrap gap-1">
      {colors.map((c) => (
        <button
          key={c}
          type="button"
          onMouseDown={(e) => onPick(e, c)}
          aria-label={`Use color ${c}`}
          className={`h-4 w-4 rounded-full ${selectedColor === c ? 'ring-2 ring-offset-1 ring-grey-800 dark:ring-offset-grey-850' : ''}`}
          style={{ backgroundColor: c }}
        />
      ))}
    </div>
  );
}
