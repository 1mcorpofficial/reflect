import { Button } from "../ui";

/**
 * Universal choices component that appears below every question.
 * Provides "Nenoriu atsakyti" (skip) and "Nežinau" (unknown) options.
 */
export default function UniversalChoices({ onSkip, onUnknown, disabled = false }) {
  return (
    <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onSkip}
        disabled={disabled}
        className="text-xs text-slate-600 hover:text-slate-800"
      >
        Nenoriu atsakyti
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onUnknown}
        disabled={disabled}
        className="text-xs text-slate-600 hover:text-slate-800"
      >
        Nežinau
      </Button>
    </div>
  );
}

