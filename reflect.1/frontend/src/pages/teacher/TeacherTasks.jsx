import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge, Button, Card } from "../../components/ui";
import { Layout } from "../../components/Layout";
import { PageHeader } from "../../components/PageHeader";
import { useAuthStore } from "../../stores/authStore";
import { api } from "../../lib/api";
import { getTemplate } from "../../data/templates";
import { ROUTES } from "../../routes";

export default function TeacherTasks() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [classesById, setClassesById] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  async function loadData() {
    setLoading(true);
    try {
      const [tasksRes, classesRes] = await Promise.all([
        api.listTeacherTasks(user.id),
        api.listTeacherClasses(user.id),
      ]);

      setTasks(tasksRes.items);
      const classMap = {};
      classesRes.items.forEach(c => { classMap[c.id] = c; });
      setClassesById(classMap);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <PageHeader 
        title="Užduotys" 
        subtitle="Jūsų sukurtos refleksijų užduotys"
        action={
          <Button onClick={() => navigate(ROUTES.TEACHER_TASKS_NEW)}>
            + Nauja užduotis
          </Button>
        }
      />

      {loading ? (
        <Card className="text-center py-12">Kraunama...</Card>
      ) : tasks.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-5xl mb-4">📋</div>
          <p className="text-slate-600 mb-3">Dar nesukūrėte užduočių</p>
          <Button onClick={() => navigate(ROUTES.TEACHER_TASKS_NEW)}>
            Sukurti pirmą užduotį
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {tasks.map(task => {
            const template = getTemplate(task.templateId);
            const cls = classesById[task.classId];
            const dueDate = task.dueAt ? new Date(task.dueAt) : null;

            return (
              <Card key={task.id} className="flex items-center justify-between">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{template?.icon || '📋'}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg text-slate-900">
                        {task.title}
                      </h3>
                      <Badge color="blue">{template?.name}</Badge>
                    </div>
                    <div className="text-sm text-slate-500 mt-1">
                      {cls ? `${cls.name} klasė` : 'Klasė nežinoma'}
                      {task.dueAt && ` • Terminas: ${dueDate.toLocaleDateString('lt-LT')}`}
                    </div>
                    {task.description && (
                      <p className="text-slate-600 text-sm mt-2">{task.description}</p>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.TEACHER_TASKS_NEW)}>
                  Nauja užduotis →
                </Button>
              </Card>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
