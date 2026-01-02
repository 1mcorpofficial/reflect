import { Badge } from "../ui";

/**
 * Progress indicator component showing completion percentage
 * and responded/total counts
 */
export default function ProgressIndicator({ 
  percentage, 
  responded, 
  total,
  showCount = true,
  size = "md"
}) {
  const percentageNum = typeof percentage === 'number' ? percentage : 0;
  const respondedNum = typeof responded === 'number' ? responded : 0;
  const totalNum = typeof total === 'number' ? total : 0;

  const getColor = () => {
    if (percentageNum >= 90) return 'bg-green-500';
    if (percentageNum >= 50) return 'bg-blue-500';
    if (percentageNum > 0) return 'bg-amber-500';
    return 'bg-slate-200';
  };

  const barHeight = size === 'sm' ? 'h-2' : size === 'lg' ? 'h-4' : 'h-3';

  return (
    <div className="w-full">
      {showCount && (
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-slate-700">
            {respondedNum} / {totalNum} atsakė
          </span>
          <Badge color={percentageNum >= 90 ? 'green' : percentageNum >= 50 ? 'blue' : 'amber'}>
            {percentageNum.toFixed(0)}%
          </Badge>
        </div>
      )}
      <div className={`w-full ${barHeight} bg-slate-200 rounded-full overflow-hidden`}>
        <div
          className={`${getColor()} ${barHeight} transition-all duration-500 ease-out rounded-full`}
          style={{ width: `${Math.min(percentageNum, 100)}%` }}
        />
      </div>
    </div>
  );
}

