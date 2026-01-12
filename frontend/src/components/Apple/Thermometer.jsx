/**
 * Apple-inspired Thermometer component (vertikali skalė)
 * 1-10 arba "blogai"-"puikiai" skalė, vertikali orientacija
 */
import clsx from "clsx";

export function Thermometer({ 
  value, 
  onChange, 
  min = 1, 
  max = 10, 
  labels = [],
  label = "",
  orientation = 'vertical', // 'vertical' | 'horizontal'
  className 
}) {
  const options = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  if (orientation === 'horizontal') {
    // Horizontal layout (similar to Scale but with thermometer styling)
    return (
      <div className={clsx("w-full", className)}>
        {label && (
          <div className="mb-4">
            <p className="text-lg font-semibold text-slate-900 mb-1">{label}</p>
          </div>
        )}
        
        <div className="flex items-end justify-between gap-1 h-32">
          {options.map((optionValue) => {
            const isSelected = value === optionValue;
            const optionLabel = labels[optionValue - min] || optionValue;
            const height = ((optionValue - min + 1) / (max - min + 1)) * 100;
            
            return (
              <button
                key={optionValue}
                type="button"
                onClick={() => onChange?.(optionValue)}
                className={clsx(
                  "flex-1 flex flex-col items-center justify-end",
                  "rounded-t-lg min-w-[40px]",
                  "transition-all duration-200 ease-out",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                  isSelected
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-slate-200 hover:bg-slate-300"
                )}
                style={{ height: `${height}%` }}
              >
                <span className="text-xs font-bold mb-1">{optionValue}</span>
                {typeof optionLabel === 'string' && optionValue === value && (
                  <span className="text-xs mb-1">{optionLabel}</span>
                )}
              </button>
            );
          })}
        </div>
        
        {labels.length > 0 && (
          <div className="mt-3 flex justify-between text-xs text-slate-500">
            <span>{labels[0]}</span>
            <span>{labels[labels.length - 1]}</span>
          </div>
        )}
      </div>
    );
  }

  // Vertical layout (true thermometer)
  return (
    <div className={clsx("w-full flex items-center justify-center", className)}>
      <div className="flex flex-col items-center">
        {label && (
          <div className="mb-4">
            <p className="text-lg font-semibold text-slate-900 mb-1">{label}</p>
          </div>
        )}
        
        <div className="relative flex flex-col-reverse items-center gap-1">
          {options.map((optionValue) => {
            const isSelected = value === optionValue;
            const optionLabel = labels[optionValue - min] || optionValue;
            
            return (
              <button
                key={optionValue}
                type="button"
                onClick={() => onChange?.(optionValue)}
                className={clsx(
                  "flex items-center justify-center",
                  "min-w-[60px] min-h-[40px] px-4 rounded-lg",
                  "transition-all duration-200 ease-out",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                  isSelected
                    ? "bg-blue-600 text-white shadow-lg scale-110"
                    : "bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200"
                )}
              >
                <span className="font-bold text-lg">{optionValue}</span>
              </button>
            );
          })}
        </div>
        
        {labels.length > 0 && (
          <div className="mt-4 flex flex-col items-center gap-2 text-xs text-slate-500">
            <span>{labels[labels.length - 1]}</span>
            <span>{labels[0]}</span>
          </div>
        )}
      </div>
    </div>
  );
}
