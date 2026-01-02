import { useMemo } from "react";
import ScheduleCard from "./ScheduleCard";
import { Card } from "../ui";

export default function DayView({ schedules, selectedDate, onDateChange, onScheduleClick }) {
  // Filter schedules for selected date
  const daySchedules = useMemo(() => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    return schedules.filter(s => {
      const scheduleDate = new Date(s.startsAt);
      return scheduleDate.toISOString().split('T')[0] === dateStr;
    }).sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt));
  }, [schedules, selectedDate]);

  const dayNames = ['Sekmadienis', 'Pirmadienis', 'Antradienis', 'Trečiadienis', 'Ketvirtadienis', 'Penktadienis', 'Šeštadienis'];
  const monthNames = ['Sausis', 'Vasaris', 'Kovas', 'Balandis', 'Gegužė', 'Birželis', 'Liepa', 'Rugpjūtis', 'Rugsėjis', 'Spalis', 'Lapkritis', 'Gruodis'];

  const isToday = selectedDate.toISOString().split('T')[0] === new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-4">
      {/* Day Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-semibold">
            {selectedDate.getDate()} {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
          </h2>
          <p className="text-slate-500">{dayNames[selectedDate.getDay()]}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              const prev = new Date(selectedDate);
              prev.setDate(prev.getDate() - 1);
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
              next.setDate(next.getDate() + 1);
              onDateChange(next);
            }}
            className="px-3 py-1 rounded border hover:bg-slate-50"
          >
            →
          </button>
        </div>
      </div>

      {/* Schedules List */}
      {daySchedules.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-5xl mb-4">📅</div>
          <p className="text-slate-600">Šią dieną nėra įvykių</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {daySchedules.map(schedule => (
            <Card
              key={schedule.id || schedule._id}
              className="hover:shadow-md transition cursor-pointer"
              onClick={() => onScheduleClick(schedule)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-slate-900 mb-1">
                    {schedule.title}
                  </h3>
                  {schedule.description && (
                    <p className="text-slate-600 text-sm mb-2">{schedule.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span>
                      {new Date(schedule.startsAt).toLocaleTimeString('lt-LT', { hour: '2-digit', minute: '2-digit' })} - {new Date(schedule.endsAt).toLocaleTimeString('lt-LT', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {schedule.progress !== undefined && (
                      <span>{schedule.progress}% užpildyta</span>
                    )}
                  </div>
                </div>
                <ScheduleCard schedule={schedule} onClick={(e) => { e.stopPropagation(); onScheduleClick(schedule); }} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

