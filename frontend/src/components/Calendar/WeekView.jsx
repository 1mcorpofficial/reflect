import { useMemo } from "react";
import ScheduleCard from "./ScheduleCard";
import { SingleActivityRing } from "../../components/Apple";

export default function WeekView({ schedules, selectedDate, onDateChange, onScheduleClick }) {
  // Get week dates (Monday to Sunday)
  const weekDates = useMemo(() => {
    const dates = [];
    const start = new Date(selectedDate);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
    start.setDate(diff);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, [selectedDate]);

  // Group schedules by date
  const schedulesByDate = useMemo(() => {
    const grouped = {};
    weekDates.forEach(date => {
      const dateStr = date.toISOString().split('T')[0];
      grouped[dateStr] = schedules.filter(s => {
        const scheduleDate = new Date(s.startsAt);
        return scheduleDate.toISOString().split('T')[0] === dateStr;
      });
    });
    return grouped;
  }, [schedules, weekDates]);

  const dayNames = ['Pr', 'An', 'Tr', 'Kt', 'Pn', 'Št', 'Sk'];
  const monthNames = ['Sausis', 'Vasaris', 'Kovas', 'Balandis', 'Gegužė', 'Birželis', 'Liepa', 'Rugpjūtis', 'Rugsėjis', 'Spalis', 'Lapkritis', 'Gruodis'];

  return (
    <div className="space-y-4">
      {/* Week Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">
          {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => {
              const prev = new Date(selectedDate);
              prev.setDate(prev.getDate() - 7);
              onDateChange(prev);
            }}
            className="px-3 py-1 rounded border hover:bg-slate-50"
          >
            ←
          </button>
          <button
            onClick={() => onDateChange(new Date())}
            className="px-3 py-1 rounded border hover:bg-slate-50 text-sm"
          >
            Šiandien
          </button>
          <button
            onClick={() => {
              const next = new Date(selectedDate);
              next.setDate(next.getDate() + 7);
              onDateChange(next);
            }}
            className="px-3 py-1 rounded border hover:bg-slate-50"
          >
            →
          </button>
        </div>
      </div>

      {/* Week Grid */}
      <div className="grid grid-cols-7 gap-2">
        {weekDates.map((date, idx) => {
          const dateStr = date.toISOString().split('T')[0];
          const daySchedules = schedulesByDate[dateStr] || [];
          const isToday = date.toISOString().split('T')[0] === new Date().toISOString().split('T')[0];
          
          return (
            <div key={idx} className="border rounded-lg p-2 min-h-[400px]">
              <div className="flex items-center justify-between mb-2">
                <div className={`text-center ${isToday ? 'font-bold text-blue-600' : ''}`}>
                  <div className="text-xs text-slate-500">{dayNames[idx]}</div>
                  <div className="text-lg">{date.getDate()}</div>
                </div>
                {daySchedules.length > 0 && (
                  <SingleActivityRing
                    percentage={Math.min((daySchedules.filter(s => s.progressData?.percentage >= 100).length / daySchedules.length) * 100, 100)}
                    color="#34c759"
                    size={32}
                    strokeWidth={4}
                  />
                )}
              </div>
              <div className="space-y-2">
                {daySchedules.map(schedule => (
                  <ScheduleCard
                    key={schedule.id || schedule._id}
                    schedule={schedule}
                    onClick={() => onScheduleClick(schedule)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

