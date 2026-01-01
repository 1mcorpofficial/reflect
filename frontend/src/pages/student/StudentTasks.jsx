import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card } from "../../components/ui";
import { Layout } from "../../components/Layout";
import { PageHeader } from "../../components/PageHeader";
import { PageContainer } from "../../components/PageContainer";
import { useAuthStore } from "../../stores/authStore";
import { api } from "../../lib/api";
import { getTemplate } from "../../data/templates";
import { getRoute, ROUTES } from "../../routes";

export default function StudentTasks() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadClassesAndTasks();
  }, [user]);

  async function loadClassesAndTasks() {
    setLoading(true);
    try {
      const classRes = await api.listStudentClasses(user.id);
      setClasses(classRes.items);
      
      const firstClassId = classRes.items[0]?.id || '';
      setSelectedClassId(firstClassId);

      if (firstClassId) {
        const res = await api.listStudentTasks(user.id, firstClassId);
        setTasks(res.items);
      } else {
        setTasks([]);
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleClassChange(classId) {
    setSelectedClassId(classId);
    setLoading(true);
    try {
      const res = await api.listStudentTasks(user.id, classId);
      setTasks(res.items);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  }

  const selectedClass = classes.find(c => c.id === selectedClassId);

  return (
    <Layout>
      <PageContainer>
        <PageHeader 
          title="Mano užduotys" 
          subtitle={selectedClass ? `Klasė: ${selectedClass.name}` : "Mokytojų paskirtos refleksijų užduotys"}
        />

        {classes.length > 1 && (
          <Card className="mb-6">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-slate-700">Pasirinkite klasę</label>
              <select
                value={selectedClassId}
                onChange={(e) => handleClassChange(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
              >
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
            </div>
          </Card>
        )}

        {loading ? (
          <Card className="text-center py-12">Kraunama...</Card>
        ) : classes.length === 0 ? (
          <Card className="text-center py-12">
            <div className="text-5xl mb-4">👥</div>
            <p className="text-slate-600">Nesate priskirtas jokiai klasei</p>
          </Card>
        ) : tasks.length === 0 ? (
          <Card className="text-center py-12">
            <div className="text-5xl mb-4">📋</div>
            <p className="text-slate-600">Šiuo metu neturite aktyvių užduočių</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {tasks.map(task => {
              const template = getTemplate(task.templateId);
              const isOverdue = task.dueAt && new Date(task.dueAt) < new Date();
              
              return (
                <Card key={task.id} className="hover:shadow-md transition">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="text-3xl">{template?.icon || '📋'}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-slate-900 mb-1">
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className="text-slate-600 text-sm mb-2">{task.description}</p>
                        )}
                        <div className="flex items-center gap-3 text-sm text-slate-500">
                          <span>Tipas: {template?.name}</span>
                          {task.dueAt && (
                            <span className={isOverdue ? 'text-rose-600 font-medium' : ''}>
                              Terminas: {new Date(task.dueAt).toLocaleDateString('lt-LT')}
                              {isOverdue && ' (Pasibaigęs)'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => navigate(`${getRoute(ROUTES.STUDENT_NEW_TEMPLATE, { templateId: task.templateId })}?taskId=${task.id}`)}
                    >
                      Pildyti
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </PageContainer>
    </Layout>
  );
}
