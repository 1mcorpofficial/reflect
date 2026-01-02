import { useMemo } from "react";
import { Badge } from "../ui";
import ProgressIndicator from "../Progress/ProgressIndicator";

export default function ScheduleCard({ schedule, onClick }) {
  const timeRemaining = useMemo(() => {
    if (schedule.status === 'expired' || schedule.status === 'cancelled') {
      return null;
    }
    
    const now = new Date();
    const endsAt = new Date(schedule.endsAt);
    const diff = endsAt - now;
    
    if (diff < 0) return 'Pasibaigęs';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }, [schedule.endsAt, schedule.status]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'green';
      case 'expired': return 'gray';
      case 'cancelled': return 'amber';
      default: return 'blue';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active': return 'Aktyvus';
      case 'expired': return 'Pasibaigęs';
      case 'cancelled': return 'Atšauktas';
      default: return status;
    }
  };

  return (
    <div
      onClick={onClick}
      className="bg-blue-50 border border-blue-200 rounded p-2 cursor-pointer hover:bg-blue-100 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 ease-in-out transform-gpu text-xs"
    >
      <div className="font-medium text-blue-900 mb-1 truncate">
        {schedule.title}
      </div>
      {timeRemaining && (
        <div className="text-blue-600 text-xs mb-1">
          ⏱ {timeRemaining}
        </div>
      )}
      <Badge color={getStatusColor(schedule.status)} size="sm">
        {getStatusLabel(schedule.status)}
      </Badge>
      {schedule.progressData && (
        <div className="mt-2">
          <ProgressIndicator
            percentage={schedule.progressData.percentage || 0}
            responded={schedule.progressData.responded || 0}
            total={schedule.progressData.total || 0}
            size="sm"
            showCount={false}
          />
        </div>
      )}
      {schedule.progress !== undefined && !schedule.progressData && (
        <div className="mt-1 text-xs text-slate-600">
          {schedule.progress}% užpildyta
        </div>
      )}
    </div>
  );
}

