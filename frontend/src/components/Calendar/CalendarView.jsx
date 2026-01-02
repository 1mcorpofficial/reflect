import WeekView from './WeekView';
import MonthView from './MonthView';
import DayView from './DayView';

export default function CalendarView({ view, schedules, selectedDate, onDateChange, onScheduleClick }) {
  switch (view) {
    case 'week':
      return (
        <WeekView
          schedules={schedules}
          selectedDate={selectedDate}
          onDateChange={onDateChange}
          onScheduleClick={onScheduleClick}
        />
      );
    case 'month':
      return (
        <MonthView
          schedules={schedules}
          selectedDate={selectedDate}
          onDateChange={onDateChange}
          onScheduleClick={onScheduleClick}
        />
      );
    case 'day':
      return (
        <DayView
          schedules={schedules}
          selectedDate={selectedDate}
          onDateChange={onDateChange}
          onScheduleClick={onScheduleClick}
        />
      );
    default:
      return <WeekView schedules={schedules} selectedDate={selectedDate} onDateChange={onDateChange} onScheduleClick={onScheduleClick} />;
  }
}

