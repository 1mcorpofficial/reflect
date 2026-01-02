/**
 * Apple-inspired Toast component
 * For "Saved" feedback and mini insights
 */
import { useEffect } from "react";
import clsx from "clsx";

export function Toast({ 
  message, 
  subtitle, 
  show, 
  onClose, 
  duration = 3000,
  variant = "default" // default, success, info
}) {
  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!show) return null;

  const variantStyles = {
    default: "bg-white border-slate-200",
    success: "bg-green-50 border-green-200",
    info: "bg-blue-50 border-blue-200",
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-scale-in">
      <div className={clsx(
        "rounded-lg border shadow-lg",
        "px-4 py-3 min-w-[200px] max-w-[90vw]",
        "transition-all duration-150",
        variantStyles[variant]
      )}>
        {message && (
          <p className="text-sm font-medium text-slate-900">
            {message}
          </p>
        )}
        {subtitle && (
          <p className="text-xs text-slate-600 mt-1">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
