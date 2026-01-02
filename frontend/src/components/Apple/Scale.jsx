/**
 * Apple-inspired Scale/Rating component
 * For quick check-in (1-5 scale like Apple Health "State of Mind")
 */
import clsx from "clsx";

export function Scale({ 
  value, 
  onChange, 
  min = 1, 
  max = 5, 
  labels = [],
  label = "",
  className 
}) {
  const options = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  return (
    <div className={clsx("w-full", className)}>
      {label && (
        <div className="mb-4">
          <p className="text-lg font-semibold text-slate-900 mb-1">{label}</p>
        </div>
      )}
      
      <div className="flex items-center justify-between gap-2">
        {options.map((optionValue) => {
          const isSelected = value === optionValue;
          const optionLabel = labels[optionValue - min] || optionValue;
          
          return (
            <button
              key={optionValue}
              type="button"
              onClick={() => onChange?.(optionValue)}
              className={clsx(
                "flex-1 flex flex-col items-center justify-center",
                "min-h-[80px] rounded-lg",
                "transition-all duration-150 ease-out",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                isSelected
                  ? "bg-blue-600 text-white shadow-md scale-105"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-blue-500"
              )}
            >
              <span className="text-2xl font-bold mb-1">{optionValue}</span>
              {typeof optionLabel === 'string' && (
                <span className="text-xs">{optionLabel}</span>
              )}
            </button>
          );
        })}
      </div>
      
      {labels.length > max && (
        <div className="mt-3 flex justify-between text-xs text-slate-500">
          <span>{labels[0]}</span>
          <span>{labels[labels.length - 1]}</span>
        </div>
      )}
    </div>
  );
}
