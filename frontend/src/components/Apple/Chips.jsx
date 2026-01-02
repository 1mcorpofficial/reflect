/**
 * Apple-inspired Chips component
 * For selecting factors/options in a tactile, tag-like way
 */
import clsx from "clsx";

export function Chips({ options, selected = [], onChange, multiple = true, className }) {
  const handleToggle = (optionId) => {
    if (multiple) {
      const newSelected = selected.includes(optionId)
        ? selected.filter(id => id !== optionId)
        : [...selected, optionId];
      onChange?.(newSelected);
    } else {
      onChange?.([optionId]);
    }
  };

  return (
    <div className={clsx("flex flex-wrap gap-2", className)}>
      {options.map((option) => {
        const isSelected = selected.includes(option.id || option.value);
        return (
          <button
            key={option.id || option.value}
            type="button"
            onClick={() => handleToggle(option.id || option.value)}
            className={clsx(
              "inline-flex items-center justify-center",
              "px-4 py-2 rounded-full",
              "text-sm font-medium",
              "min-h-[44px]", // Apple HIG tap target
              "transition-all duration-150 ease-out",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
              isSelected
                ? "bg-blue-600 text-white shadow-sm hover:bg-blue-700"
                : "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 hover:border-blue-500"
            )}
          >
            {option.label || option.name}
          </button>
        );
      })}
    </div>
  );
}
