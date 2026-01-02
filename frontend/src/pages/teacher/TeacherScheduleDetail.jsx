import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Card, Badge } from "../../components/ui";
import { Layout } from "../../components/Layout";
import { PageHeader } from "../../components/PageHeader";
import ProgressIndicator from "../../components/Progress/ProgressIndicator";
import StudentList from "../../components/Progress/StudentList";
import { getSchedule, getScheduleProgress, deleteSchedule, updateSchedule } from "../../api/schedules";
import { getResponses } from "../../api/responses";
import { ROUTES } from "../../routes";

export default function TeacherScheduleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState(null);
  const [progress, setProgress] = useState(null);
  const [students, setStudents] = useState([]);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  async function loadData() {
    try {
      const [scheduleRes, progressRes] = await Promise.all([
        getSchedule(id),
        getScheduleProgress(id),
      ]);

      setSchedule(scheduleRes.data);
      setProgress(progressRes.data);
      setStudents(progressRes.data?.students || []);
      setResponses(progressRes.data?.responses || []);
    } catch (error) {
      console.error('Failed to load schedule:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm('Ar tikrai norite ištrinti šį įvykį? Visi atsakymai bus prarasti.')) {
      return;
    }

    setDeleting(true);
    try {
      await deleteSchedule(id);
      navigate(ROUTES.TEACHER_CALENDAR);
    } catch (error) {
      console.error('Failed to delete schedule:', error);
      alert('Nepavyko ištrinti įvykio');
    } finally {
      setDeleting(false);
    }
  }

  async function handleCancel() {
    if (!window.confirm('Ar tikrai norite atšaukti šį įvykį?')) {
      return;
    }

    try {
      await updateSchedule(id, { status: 'cancelled' });
      loadData(); // Reload to update status
    } catch (error) {
      console.error('Failed to cancel schedule:', error);
      alert('Nepavyko atšaukti įvykio');
    }
  }

  const handleStudentClick = (student) => {
    if (student.response) {
      navigate(`${ROUTES.TEACHER_REFLECTION_DETAIL}`.replace(':id', student.response.id || student.response._id));
    }
  };

  if (loading) {
    return (
      <Layout>
        <Card className="text-center py-12">Kraunama...</Card>
      </Layout>
    );
  }

  if (!schedule) {
    return (
      <Layout>
        <Card className="text-center py-12">
          <p>Įvykis nerastas</p>
          <Button className="mt-4" onClick={() => navigate(ROUTES.TEACHER_CALENDAR)}>
            Grįžti į kalendorių
          </Button>
        </Card>
      </Layout>
    );
  }

  const isExpired = schedule.status === 'expired';
  const isCancelled = schedule.status === 'cancelled';
  const isActive = schedule.status === 'active';

  return (
    <Layout>
      <PageHeader
        title={schedule.title}
        subtitle={schedule.description || 'Refleksijų įvykio detalės'}
        action={
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                const url = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/exports/schedule/${id}/csv`;
                window.open(url, '_blank');
              }}
            >
              📊 CSV
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                const url = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/exports/schedule/${id}/pdf`;
                window.open(url, '_blank');
              }}
            >
              📄 PDF
            </Button>
            {isActive && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCancel}
              >
                Atšaukti
              </Button>
            )}
            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? 'Trinama...' : 'Ištrinti'}
            </Button>
          </div>
        }
      />

      {/* Status and dates */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-slate-500 mb-1">Būsena</div>
            <Badge
              color={
                isCancelled ? 'rose' :
                isExpired ? 'amber' :
                'green'
              }
            >
              {isCancelled ? 'Atšauktas' :
               isExpired ? 'Pasibaigęs' :
               'Aktyvus'}
            </Badge>
          </div>
          <div>
            <div className="text-sm text-slate-500 mb-1">Pradžia</div>
            <div className="font-medium">
              {new Date(schedule.startsAt).toLocaleString('lt-LT')}
            </div>
          </div>
          <div>
            <div className="text-sm text-slate-500 mb-1">Pabaiga</div>
            <div className="font-medium">
              {new Date(schedule.endsAt).toLocaleString('lt-LT')}
            </div>
          </div>
          <div>
            <div className="text-sm text-slate-500 mb-1">Privatumo režimas</div>
            <div className="font-medium">
              {schedule.privacyMode === 'named' ? 'Vardinis' :
               schedule.privacyMode === 'pseudo_anon' ? 'Pseudonimas' :
               'Anoniminis agregatas'}
            </div>
          </div>
        </div>
      </Card>

      {/* Progress */}
      <Card className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Progresas</h2>
        <ProgressIndicator
          percentage={progress?.percentage || 0}
          responded={progress?.responded || 0}
          total={progress?.total || 0}
          size="lg"
        />
      </Card>

      {/* Student list */}
      <Card>
        <h2 className="text-lg font-semibold mb-4">Mokiniai</h2>
        {students.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            Nėra priskirtų mokinių
          </div>
        ) : (
          <StudentList
            students={students}
            responses={responses}
            scheduleId={id}
            onStudentClick={handleStudentClick}
          />
        )}
      </Card>
    </Layout>
  );
}

