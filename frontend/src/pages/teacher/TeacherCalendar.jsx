import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card } from "../../components/ui";
import { Layout } from "../../components/Layout";
import { PageHeader } from "../../components/PageHeader";
import { getSchedules, getScheduleProgress } from "../../api/schedules";
import { ROUTES } from "../../routes";
import CalendarView from "../../components/Calendar/CalendarView";

export default function TeacherCalendar() {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('week'); // week, month, day
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    loadSchedules();
  }, [selectedDate]);

  async function loadSchedules() {
    try {
      const startDate = new Date(selectedDate);
      startDate.setDate(startDate.getDate() - 7); // Load week before
      
      const endDate = new Date(selectedDate);
      endDate.setDate(endDate.getDate() + 30); // Load month ahead
      
      const response = await getSchedules({
        from: startDate.toISOString(),
        to: endDate.toISOString(),
      });
      
      // Optionally fetch progress for schedules (can be slow if many schedules)
      // For now, just set schedules without progress (will be loaded on detail page)
      setSchedules(response.data || []);
    } catch (error) {
      console.error('Failed to load schedules:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <PageHeader 
        title="Kalendorius" 
        subtitle="Refleksijų įvykių valdymas"
        action={
          <Button onClick={() => navigate(ROUTES.TEACHER_TASKS_NEW)}>
            + Naujas įvykis
          </Button>
        }
      />

      {/* View Toggle */}
      <Card className="mb-6">
        <div className="flex gap-2">
          <Button
            variant={view === 'week' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setView('week')}
          >
            Savaitė
          </Button>
          <Button
            variant={view === 'month' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setView('month')}
          >
            Mėnuo
          </Button>
          <Button
            variant={view === 'day' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setView('day')}
          >
            Diena
          </Button>
        </div>
      </Card>

      {loading ? (
        <Card className="text-center py-12">Kraunama...</Card>
      ) : (
        <CalendarView
          view={view}
          schedules={schedules}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          onScheduleClick={(schedule) => navigate(`${ROUTES.TEACHER_SCHEDULE_DETAIL}`.replace(':id', schedule.id || schedule._id))}
        />
      )}
    </Layout>
  );
}

