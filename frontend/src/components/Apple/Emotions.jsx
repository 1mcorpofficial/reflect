/**
 * Apple-inspired Emotions component
 * Veidukai/ikonos, grupavimas į teigiamas/neutralias/neigiamas
 */
import clsx from "clsx";

const DEFAULT_EMOTIONS = [
  { id: 'happy', label: 'Laimingas', icon: '😊', group: 'positive' },
  { id: 'excited', label: 'Susijaudinęs', icon: '🤩', group: 'positive' },
  { id: 'proud', label: 'Didžiuojuosi', icon: '😌', group: 'positive' },
  { id: 'calm', label: 'Ram us', icon: '😐', group: 'neutral' },
  { id: 'neutral', label: 'Neutral us', icon: '😶', group: 'neutral' },
  { id: 'confused', label: 'Susipainiojęs', icon: '😕', group: 'negative' },
  { id: 'sad', label: 'Liūdnas', icon: '😢', group: 'negative' },
  { id: 'anxious', label: 'Nerimastingas', icon: '😰', group: 'negative' },
];

export function Emotions({ 
  value, 
  onChange, 
  emotions = DEFAULT_EMOTIONS,
  multiple = false,
  label = "",
  className 
}) {
  const handleToggle = (emotionId) => {
    if (multiple) {
      const current = Array.isArray(value) ? value : [];
      const newValue = current.includes(emotionId)
        ? current.filter(id => id !== emotionId)
        : [...current, emotionId];
      onChange?.(newValue);
    } else {
      onChange?.([emotionId]);
    }
  };

  const grouped = emotions.reduce((acc, emotion) => {
    if (!acc[emotion.group]) acc[emotion.group] = [];
    acc[emotion.group].push(emotion);
    return acc;
  }, {});

  const isSelected = (emotionId) => {
    if (multiple) {
      return Array.isArray(value) && value.includes(emotionId);
    }
    return Array.isArray(value) && value[0] === emotionId;
  };

  const groupLabels = {
    positive: 'Teigiamos',
    neutral: 'Neutralios',
    negative: 'Neigiamos',
  };

  return (
    <div className={clsx("w-full", className)}>
      {label && (
        <div className="mb-4">
          <p className="text-lg font-semibold text-slate-900 mb-1">{label}</p>
        </div>
      )}
      
      <div className="space-y-6">
        {Object.entries(grouped).map(([group, groupEmotions]) => (
          <div key={group}>
            <h4 className="text-sm font-medium text-slate-600 mb-3">
              {groupLabels[group] || group}
            </h4>
            <div className="flex flex-wrap gap-3">
              {groupEmotions.map((emotion) => {
                const selected = isSelected(emotion.id);
                return (
                  <button
                    key={emotion.id}
                    type="button"
                    onClick={() => handleToggle(emotion.id)}
                    className={clsx(
                      "flex flex-col items-center justify-center",
                      "min-h-[80px] min-w-[80px] rounded-xl border-2 px-3 py-2",
                      "transition-all duration-200 ease-out",
                      "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                      selected
                        ? "bg-blue-600 text-white border-blue-600 shadow-md scale-105"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-blue-300"
                    )}
                  >
                    <span className="text-3xl mb-1">{emotion.icon}</span>
                    <span className="text-xs font-medium">{emotion.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
