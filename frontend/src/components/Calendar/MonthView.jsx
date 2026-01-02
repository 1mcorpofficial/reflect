import { useMemo } from "react";
import ScheduleCard from "./ScheduleCard";
import { SingleActivityRing } from "../../components/Apple";

export default function MonthView({ schedules, selectedDate, onDateChange, onScheduleClick }) {
  // Get month dates
  const monthDates = useMemo(() => {
    const dates = [];
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    
    // First day of month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Start from Monday of the week containing first day
    const startDate = new Date(firstDay);
    const day = startDate.getDay();
    const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
    startDate.setDate(diff);
    
    // Generate 6 weeks (42 days) to fill the calendar
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date);
    }
    
    return { dates, firstDay, lastDay };
  }, [selectedDate]);

  // Group schedules by date
  const schedulesByDate = useMemo(() => {
    const grouped = {};
    monthDates.dates.forEach(date => {
      const dateStr = date.toISOString().split('T')[0];
      grouped[dateStr] = schedules.filter(s => {
        const scheduleDate = new Date(s.startsAt);
        return scheduleDate.toISOString().split('T')[0] === dateStr;
      });
    });
    return grouped;
  }, [schedules, monthDates]);

  const dayNames = ['Pr', 'An', 'Tr', 'Kt', 'Pn', 'Št', 'Sk'];
  const monthNames = ['Sausis', 'Vasaris', 'Kovas', 'Balandis', 'Gegužė', 'Birželis', 'Liepa', 'Rugpjūtis', 'Rugsėjis', 'Spalis', 'Lapkritis', 'Gruodis'];

  return (
    <div className="space-y-4">
      {/* Month Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">
          {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => {
              const prev = new Date(selectedDate);
              prev.setMonth(prev.getMonth() - 1);
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
              next.setMonth(next.getMonth() + 1);
              onDateChange(next);
            }}
            className="px-3 py-1 rounded border hover:bg-slate-50"
          >
            →
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="border rounded-lg overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 bg-slate-100 border-b">
          {dayNames.map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-slate-700">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar days */}
        <div className="grid grid-cols-7">
          {monthDates.dates.map((date, idx) => {
            const dateStr = date.toISOString().split('T')[0];
            const daySchedules = schedulesByDate[dateStr] || [];
            const isToday = dateStr === new Date().toISOString().split('T')[0];
            const isCurrentMonth = date.getMonth() === selectedDate.getMonth();
            
            return (
              <div
                key={idx}
                className={`min-h-[100px] border-r border-b p-2 ${
                  !isCurrentMonth ? 'bg-slate-50 text-slate-400' : ''
                } ${isToday ? 'bg-blue-50' : ''}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className={`text-sm ${isToday ? 'font-bold text-blue-600' : ''}`}>
                    {date.getDate()}
                  </div>
                  {daySchedules.length > 0 && (
                    <SingleActivityRing
                      percentage={Math.min((daySchedules.filter(s => s.progressData?.percentage >= 100).length / daySchedules.length) * 100, 100)}
                      color="#34c759"
                      size={24}
                      strokeWidth={3}
                    />
                  )}
                </div>
                <div className="space-y-1">
                  {daySchedules.slice(0, 3).map(schedule => (
                    <ScheduleCard
                      key={schedule.id || schedule._id}
                      schedule={schedule}
                      onClick={() => onScheduleClick(schedule)}
                    />
                  ))}
                  {daySchedules.length > 3 && (
                    <div className="text-xs text-slate-500">
                      +{daySchedules.length - 3} daugiau
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

