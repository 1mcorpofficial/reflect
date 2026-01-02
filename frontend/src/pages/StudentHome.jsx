import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Card, Badge } from "../components/ui";
import { Layout } from "../components/Layout";
import { PageHeader } from "../components/PageHeader";
import { ActionCard } from "../components/ActionCard";
import { ReflectionActionDialog } from "../components/ReflectionActionDialog";
import { PageContainer } from "../components/PageContainer";
import { ActivityRings } from "../components/Apple";
import { LineChart } from "../components/Charts";
import { useAuthStore } from "../stores/authStore";
import { api } from "../lib/api";
import { getStudentStats } from "../api/analytics";
import { ROUTES } from "../routes";
import { getTemplate } from "../data/templates";

export default function StudentHome() {
  const { user } = useAuthStore();
  const [reflections, setReflections] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReflectionDialog, setShowReflectionDialog] = useState(false);

  useEffect(() => {
    loadData();
  }, [user]);

  async function loadData() {
    if (!user) return;
    
    try {
      const [reflectionsRes, tasksRes, statsData] = await Promise.all([
        api.listStudentReflections(user.id),
        api.listStudentTasks(user.id),
        getStudentStats().catch(() => null),
      ]);
      
      setReflections(reflectionsRes.items.slice(0, 10));
      setTasks(tasksRes.items);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <PageContainer className="relative">
        <div className="pointer-events-none absolute -left-24 top-0 h-40 w-40 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="pointer-events-none absolute right-10 top-10 h-56 w-56 rounded-full bg-emerald-200/35 blur-3xl" />
        <div className="pointer-events-none absolute bottom-10 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-amber-200/30 blur-3xl" />

        <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-8 animate-fade-in">
          <PageHeader 
            title="Mano refleksijos" 
            subtitle="Apmąstykite savo mokymąsi ir sekite pažangą"
            align="center"
          />

          {/* Main action button */}
          <div className="w-full max-w-4xl">
            <ActionCard 
              icon="✍️"
              title="Refleksija"
              subtitle="Rašyti arba peržiūrėti refleksijas"
              className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl"
              align="center"
              onClick={() => setShowReflectionDialog(true)}
            />
          </div>

        {showReflectionDialog && (
          <ReflectionActionDialog onClose={() => setShowReflectionDialog(false)} />
        )}

        {/* Recent reflections */}
          <div className="w-full max-w-4xl">
            <Card className="mb-4 w-full backdrop-blur">
              <div className="mb-6 flex flex-col items-center gap-3 text-center">
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
                      <Link key={r.id} to={`${ROUTES.STUDENT_REFLECTION_DETAIL}`.replace(':id', r.id)} className="block">
                        <div 
                          className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white/90 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow"
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
          </div>

        {/* Tasks section */}
          <div className="w-full max-w-4xl">
            <Card className="w-full backdrop-blur">
              <div className="mb-6 flex flex-col items-center gap-3 text-center">
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
                      className="flex items-center justify-between rounded-lg border border-slate-200 bg-white/90 p-4 shadow-sm"
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
          </div>

          {/* Stats */}
          <div className="w-full max-w-4xl">
            <Card className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-xl text-slate-900">Mano statistika</h2>
                <Link to={ROUTES.STUDENT_STATS}>
                  <Button variant="ghost" size="sm">Detaliau →</Button>
                </Link>
              </div>
              
              {stats && (
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-shrink-0">
                    <ActivityRings
                      completed={stats.totalReflections > 0 ? (stats.reviewedCount / stats.totalReflections) * 100 : 0}
                      progress={stats.totalReflections > 0 ? (stats.withComments / stats.totalReflections) * 100 : 0}
                      goal={stats.averageMood ? (stats.averageMood / 5) * 100 : 0}
                      size={140}
                      strokeWidth={10}
                    />
                  </div>
                  
                  <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{stats.totalReflections || 0}</div>
                      <div className="text-xs text-slate-600 mt-1">Refleksijos</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{stats.reviewedCount || 0}</div>
                      <div className="text-xs text-slate-600 mt-1">Peržiūrėtos</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-amber-600">{stats.withComments || 0}</div>
                      <div className="text-xs text-slate-600 mt-1">Komentarai</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-slate-600">{stats.averageMood?.toFixed(1) || '—'}</div>
                      <div className="text-xs text-slate-600 mt-1">Vid. nuotaika</div>
                    </div>
                  </div>
                </div>
              )}
            </Card>
            
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
          </div>
        </div>
      </PageContainer>
    </Layout>
  );
}
