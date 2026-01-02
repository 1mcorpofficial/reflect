/**
 * Apple-inspired Sentence Completion component
 * Nebaigti sakiniai/žodžiai - studentas užbaigia pradėtą sakinį
 */
import clsx from "clsx";
import { Input, Textarea } from '../ui';

export function SentenceCompletion({ 
  value, 
  onChange, 
  template = "Šiandien supratau...",
  label = "",
  multiline = false,
  className 
}) {
  const handleChange = (e) => {
    onChange?.(e.target.value);
  };

  return (
    <div className={clsx("w-full", className)}>
      {label && (
        <div className="mb-4">
          <p className="text-lg font-semibold text-slate-900 mb-1">{label}</p>
        </div>
      )}
      
      <div className="space-y-3">
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
          <p className="text-base text-slate-700">
            {template.split('...')[0]}
            <span className="font-semibold text-blue-600">...</span>
          </p>
        </div>
        
        {multiline ? (
          <Textarea
            value={value || ''}
            onChange={handleChange}
            placeholder="Užbaikite sakinį..."
            rows={4}
            className="resize-none"
          />
        ) : (
          <Input
            type="text"
            value={value || ''}
            onChange={handleChange}
            placeholder="Užbaikite sakinį..."
            className="text-base"
          />
        )}
        
        <p className="text-xs text-slate-500">
          Užbaikite pradėtą sakinį savais žodžiais
        </p>
      </div>
    </div>
  );
}
