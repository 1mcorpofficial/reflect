import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Card, Badge } from "../components/ui";
import { Layout } from "../components/Layout";
import { PageHeader } from "../components/PageHeader";
import { ActionCard } from "../components/ActionCard";
import { ReflectionActionDialog } from "../components/ReflectionActionDialog";
import { PageContainer } from "../components/PageContainer";
import { useAuthStore } from "../stores/authStore";
import { api } from "../lib/api";
import { ROUTES } from "../routes";
import { getTemplate } from "../data/templates";

export default function StudentHome() {
  const { user } = useAuthStore();
  const [reflections, setReflections] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReflectionDialog, setShowReflectionDialog] = useState(false);

  useEffect(() => {
    loadData();
  }, [user]);

  async function loadData() {
    if (!user) return;
    
    try {
      const [reflectionsRes, tasksRes] = await Promise.all([
        api.listStudentReflections(user.id),
        api.listStudentTasks(user.id),
      ]);
      
      setReflections(reflectionsRes.items.slice(0, 10));
      setTasks(tasksRes.items);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <PageContainer>
        <PageHeader 
          title="Mano refleksijos" 
          subtitle="Apmąstykite savo mokymąsi ir sekite pažangą"
        />

        {/* Main action button */}
        <div className="mb-10">
          <ActionCard 
            icon="✍️"
            title="Refleksija"
            subtitle="Rašyti arba peržiūrėti refleksijas"
            className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0"
            onClick={() => setShowReflectionDialog(true)}
          />
        </div>

        {showReflectionDialog && (
          <ReflectionActionDialog onClose={() => setShowReflectionDialog(false)} />
        )}

        {/* Recent reflections */}
        <Card className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <h2 className="font-semibold text-xl text-slate-900">Mano refleksijos</h2>
            {reflections.length > 0 && (
              <Link to={ROUTES.STUDENT_HISTORY}>
                <Button variant="ghost" size="sm">
                  Visos →
                </Button>
              </Link>
            )}
          </div>
          
          {loading ? (
            <div className="text-center py-8 text-slate-500">Kraunama...</div>
          ) : reflections.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <div className="text-4xl mb-3">📝</div>
              <p>Dar nėra refleksijų</p>
              <p className="text-sm mt-1">Pradėkite nuo pirmosios refleksijos</p>
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

        {/* Tasks section */}
        <Card className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <h2 className="font-semibold text-xl text-slate-900">Mano užduotys</h2>
            {tasks.length > 0 && (
              <Link to={ROUTES.STUDENT_TASKS}>
                <Button variant="ghost" size="sm">
                  Visos →
                </Button>
              </Link>
            )}
          </div>

          {loading ? (
            <div className="text-center py-8">Kraunama...</div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <div className="text-3xl mb-2">✓</div>
              <p>Nėra aktyvių užduočių</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.slice(0, 5).map(t => (
                <div 
                  key={t.id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                >
                  <div>
                    <div className="font-medium text-slate-900">{t.title}</div>
                    <div className="text-sm text-slate-500">
                      Terminas: {new Date(t.dueAt).toLocaleDateString('lt-LT')}
                    </div>
                  </div>
                  <Button size="sm" variant="primary">
                    Pildyti
                  </Button>
                </div>
              ))}
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
            <div className="text-xs sm:text-sm text-slate-600 mt-2">Užduotys</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-slate-600">
              {reflections.filter(r => r.teacherComment).length}
            </div>
            <div className="text-xs sm:text-sm text-slate-600 mt-2">Komentarai</div>
          </Card>
        </div>
      </PageContainer>
    </Layout>
  );
}
