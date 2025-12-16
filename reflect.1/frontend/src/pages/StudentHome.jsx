import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Card, Badge } from "../components/ui";
import { Layout } from "../components/Layout";
import { PageHeader } from "../components/PageHeader";
import { ActionCard } from "../components/ActionCard";
import { useAuthStore } from "../stores/authStore";
import { api } from "../lib/api";
import { ROUTES } from "../routes";
import { getTemplate } from "../data/templates";

export default function StudentHome() {
  const { user } = useAuthStore();
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
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
        <ActionCard 
          to={ROUTES.STUDENT_NEW}
          icon="✍️"
          title="Refleksija"
          subtitle="Sukurkite savaitės ar pamokos refleksiją"
          className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0"
        />

        <ActionCard 
          to={ROUTES.STUDENT_HISTORY}
          icon="📚"
          title="Mano istorija"
          subtitle="Ankstesnės refleksijos"
        />

        <ActionCard 
          to={ROUTES.STUDENT_TASKS}
          icon="📋"
          title="Mano užduotys"
          subtitle={`Mokytojų paskirtos (${tasks.length})`}
        />
      </div>

      {/* Recent reflections */}
      <Card className="mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <h2 className="font-semibold text-xl text-slate-900">Naujausios refleksijos</h2>
          <Link to={ROUTES.STUDENT_HISTORY}>
            <Button variant="ghost" size="sm">
              Visos →
            </Button>
          </Link>
        </div>
        
        {loading ? (
          <div className="text-center py-8 text-slate-500">Kraunama...</div>
        ) : reflections.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <div className="text-4xl mb-3">📝</div>
            <p>Dar neturite refleksijų</p>
            <p className="text-sm mt-1">Pradėkite nuo naujos refleksijos sukūrimo</p>
            <Link to={ROUTES.STUDENT_NEW}>
              <Button className="mt-4">
                Sukurti pirmą refleksiją
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {reflections.map(r => {
              const template = getTemplate(r.templateId);
              return (
                <Link key={r.id} to={`${ROUTES.STUDENT_REFLECTION_DETAIL}`.replace(':id', r.id)}>
                  <div 
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-3 flex-1">
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
                </Link>
              );
            })}
          </div>
        )}
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="text-center">
          <div className="text-2xl sm:text-3xl font-bold text-blue-600">{reflections.length || 0}</div>
          <div className="text-xs sm:text-sm text-slate-600 mt-2">Refleksijos</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl sm:text-3xl font-bold text-green-600">
            {reflections.filter(r => r.status === 'reviewed').length}
          </div>
          <div className="text-xs sm:text-sm text-slate-600 mt-2">Peržiūrėtos</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl sm:text-3xl font-bold text-amber-600">{tasks.length}</div>
          <div className="text-xs sm:text-sm text-slate-600 mt-2">Aktyvios užduotys</div>
        </Card>
        <Card className="text-center">
          <div className="text-xl sm:text-2xl font-bold text-slate-600">{classes[0]?.name || '—'}</div>
          <div className="text-xs sm:text-sm text-slate-600 mt-2">Klasė</div>
        </Card>
      </div>
    </Layout>
  );
}
