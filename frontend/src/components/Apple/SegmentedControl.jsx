/**
 * Apple-inspired Segmented Control
 * For switching between views (Lesson/Week/Test/Project)
 */
import clsx from "clsx";

export function SegmentedControl({ options, value, onChange, className }) {
  return (
    <div className={clsx(
      "inline-flex rounded-lg bg-slate-100 p-1",
      className
    )}>
      {options.map((option) => {
        const isSelected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange?.(option.value)}
            className={clsx(
              "px-4 py-2 rounded-md",
              "text-sm font-medium",
              "min-h-[44px]", // Apple HIG tap target
              "transition-all duration-150 ease-out",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
              isSelected
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
