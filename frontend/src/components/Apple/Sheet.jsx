/**
 * Apple-inspired Sheet/Modal component
 * For focused tasks (like Apple's bottom sheets)
 */
import { useEffect } from "react";
import clsx from "clsx";

export function Sheet({ 
  children, 
  isOpen, 
  onClose, 
  title,
  subtitle,
  showCloseButton = true 
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        style={{ animation: 'fadeIn 180ms cubic-bezier(0.0, 0.0, 0.2, 1)' }}
        onClick={onClose}
      />
      
      {/* Sheet */}
      <div 
        className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-xl shadow-xl"
        style={{ animation: 'slideIn 240ms cubic-bezier(0.0, 0.0, 0.2, 1)' }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-slate-300 rounded-full" />
        </div>
        
        {/* Header */}
        {(title || subtitle) && (
          <div className="px-6 pb-4 border-b border-slate-200">
            {showCloseButton && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
                aria-label="Uždaryti"
              >
                <span className="text-xl text-slate-600">×</span>
              </button>
            )}
            {title && (
              <h2 className="text-xl font-semibold text-slate-900 pr-8">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-sm text-slate-600 mt-1">
                {subtitle}
              </p>
            )}
          </div>
        )}
        
        {/* Content */}
        <div className="px-6 py-6 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </>
  );
}
