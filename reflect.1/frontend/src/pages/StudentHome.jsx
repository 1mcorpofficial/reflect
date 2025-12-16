import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Badge } from "../components/ui";
import { Layout } from "../components/Layout";
import { PageHeader } from "../components/PageHeader";
import { useAuthStore } from "../stores/authStore";
import { api } from "../lib/api";
import { ROUTES } from "../routes";
import { getTemplate } from "../data/templates";

export default function StudentHome() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [reflections, setReflections] = useState([]);
  const [classes, setClasses] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  async function loadData() {
    if (!user) return;
    
    try {
      const [reflectionsRes, classesRes] = await Promise.all([
        api.listStudentReflections(user.id),
        api.listStudentClasses(user.id),
      ]);
      
      setReflections(reflectionsRes.items.slice(0, 5));
      setClasses(classesRes.items);
      
      if (classesRes.items.length > 0) {
        const tasksRes = await api.listStudentTasks(user.id, classesRes.items[0].id);
        setTasks(tasksRes.items);
      } else {
        setTasks([]);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>

      <PageHeader 
        title="Mano refleksijos" 
        subtitle="Peržiūrėkite ir kurkite naujas refleksijas"
      />

      {/* Quick actions */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Card 
          className="hover:shadow-lg transition cursor-pointer bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0"
          onClick={() => navigate(ROUTES.STUDENT_NEW)}
        >
          <div className="text-3xl mb-2">✍️</div>
          <h3 className="font-semibold text-lg">Nauja refleksija</h3>
          <p className="text-blue-100 text-sm mt-1">Sukurkite savaitės ar pamokos refleksiją</p>
        </Card>

        <Card 
          className="hover:shadow-lg transition cursor-pointer"
          onClick={() => navigate(ROUTES.STUDENT_HISTORY)}
        >
          <div className="text-3xl mb-2">📚</div>
          <h3 className="font-semibold text-lg text-slate-900">Mano istorija</h3>
          <p className="text-slate-600 text-sm mt-1">Ankstesnės refleksijos</p>
        </Card>

        <Card 
          className="hover:shadow-lg transition cursor-pointer"
          onClick={() => navigate(ROUTES.STUDENT_TASKS)}
        >
          <div className="text-3xl mb-2">📋</div>
          <h3 className="font-semibold text-lg text-slate-900">Užduotys</h3>
          <p className="text-slate-600 text-sm mt-1">
            Mokytojų paskirtos ({tasks.length})
          </p>
        </Card>
      </div>

      {/* Recent reflections */}
      <Card className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg text-slate-900">Naujausios refleksijos</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.STUDENT_HISTORY)}>
            Visos →
          </Button>
        </div>
        
        {loading ? (
          <div className="text-center py-8 text-slate-500">Kraunama...</div>
        ) : reflections.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <div className="text-4xl mb-3">📝</div>
            <p>Dar neturite refleksijų</p>
            <p className="text-sm mt-1">Pradėkite nuo naujos refleksijos sukūrimo</p>
            <Button className="mt-4" onClick={() => navigate(ROUTES.STUDENT_NEW)}>
              Sukurti pirmą refleksiją
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {reflections.map(r => {
              const template = getTemplate(r.templateId);
              return (
                <div 
                  key={r.id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                  onClick={() => navigate(`/student/reflections/${r.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{template?.icon || '📝'}</div>
                    <div>
                      <div className="font-medium text-slate-900">{template?.name || 'Refleksija'}</div>
                      <div className="text-sm text-slate-500">
                        {new Date(r.createdAt).toLocaleDateString('lt-LT')}
                      </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {r.taskId && (
                    <Badge color="amber">📋 Užduotis</Badge>
                  )}
                  <Badge color={r.status === 'reviewed' ? 'green' : 'blue'}>
                    {r.status === 'reviewed' ? '✓ Peržiūrėta' : 'Pateikta'}
                  </Badge>
                  {r.teacherComment && (
                    <Badge color="amber">💬 Komentaras</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <div className="text-2xl font-bold text-blue-600">{reflections.length || 0}</div>
          <div className="text-sm text-slate-600">Refleksijos</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {reflections.filter(r => r.status === 'reviewed').length}
          </div>
          <div className="text-sm text-slate-600">Peržiūrėtos</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-amber-600">{tasks.length}</div>
          <div className="text-sm text-slate-600">Aktyvios užduotys</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-slate-600">{classes[0]?.name || '—'}</div>
          <div className="text-sm text-slate-600">Klasė</div>
        </Card>
      </div>
    </Layout>
  );
}
