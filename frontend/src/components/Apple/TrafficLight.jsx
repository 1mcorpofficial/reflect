/**
 * Apple-inspired Traffic Light component (Šviesoforas)
 * 3 būsenos: žalia, geltona, raudona (su prasmės pervadinimu)
 */
import clsx from "clsx";

export function TrafficLight({ 
  value, 
  onChange, 
  options = [
    { value: 'green', label: 'Supratau', icon: '🟢', color: 'green' },
    { value: 'yellow', label: 'Iš dalies', icon: '🟡', color: 'yellow' },
    { value: 'red', label: 'Nesupratau', icon: '🔴', color: 'red' },
  ],
  label = "",
  className 
}) {
  return (
    <div className={clsx("w-full relative z-0", className)}>
      {label && (
        <div className="mb-4">
          <p className="text-lg font-semibold text-slate-900 mb-1">{label}</p>
        </div>
      )}
      
      <div className="flex items-center justify-center gap-4 flex-wrap">
        {options.map((option) => {
          const isSelected = value === option.value;
          
          const colorClasses = {
            green: {
              selected: 'bg-green-500 text-white shadow-lg scale-110',
              unselected: 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100',
            },
            yellow: {
              selected: 'bg-yellow-500 text-white shadow-lg scale-110',
              unselected: 'bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100',
            },
            red: {
              selected: 'bg-red-500 text-white shadow-lg scale-110',
              unselected: 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100',
            },
          };
          
          const colors = colorClasses[option.color] || colorClasses.green;
          
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange?.(option.value)}
              className={clsx(
                "flex flex-col items-center justify-center",
                "min-h-[120px] min-w-[100px] rounded-xl border-2 px-4 py-4",
                "transition-all duration-200 ease-out",
                "focus:outline-none focus:ring-2 focus:ring-offset-2",
                isSelected
                  ? colors.selected + " focus:ring-blue-500"
                  : colors.unselected + " border-opacity-50 focus:ring-blue-300"
              )}
            >
              <span className="text-4xl mb-2">{option.icon || '●'}</span>
              <span className="text-sm font-medium">{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
