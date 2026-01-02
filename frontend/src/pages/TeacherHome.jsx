import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Card, Badge } from "../components/ui";
import { Layout } from "../components/Layout";
import { PageHeader } from "../components/PageHeader";
import { ActionCard } from "../components/ActionCard";
import { useAuthStore } from "../stores/authStore";
import { api } from "../lib/api";
import { ROUTES } from "../routes";

export default function TeacherHome() {
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
      const [reflectionsRes, classesRes, tasksRes] = await Promise.all([
        api.listTeacherReflections({ status: 'submitted' }),
        api.listTeacherClasses(user.id),
        api.listTeacherTasks(user.id),
      ]);
      
      setReflections(reflectionsRes.items);
      setClasses(classesRes.items);
      setTasks(tasksRes.items);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <PageHeader 
        title="Mokytojo skydelis" 
        subtitle="Valdykite klases ir peržiūrėkite mokinių refleksijas"
      />

      {/* Quick actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 animate-fade-in">
        <ActionCard 
          to={ROUTES.TEACHER_TASKS_NEW}
          icon="📋"
          title="Nauja užduotis"
          subtitle="Sukurkite refleksijos užduotį klasei"
          className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0"
        />

        <ActionCard 
          to={ROUTES.TEACHER_CLASSES}
          icon="👥"
          title="Mano klasės"
          subtitle={`Valdykite mokinių grupes (${classes.length})`}
        />

        <ActionCard 
          to={ROUTES.TEACHER_REVIEW}
          icon="📊"
          title="Peržiūra"
          subtitle="Mokinių refleksijos"
        />

        <ActionCard 
          to={ROUTES.TEACHER_CALENDAR}
          icon="📅"
          title="Kalendorius"
          subtitle="Refleksijų įvykių valdymas"
        />

        <ActionCard 
          to={ROUTES.TEACHER_STATS}
          icon="📊"
          title="Statistika"
          subtitle="Analitika ir rodikliai"
        />
      </div>

      {/* Pending reviews */}
      <Card className="mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <h2 className="font-semibold text-xl text-slate-900">Laukia peržiūros</h2>
          <Badge color={reflections.length > 0 ? "amber" : "green"}>
            {reflections.length} {reflections.length === 1 ? 'nauja' : 'naujos'}
          </Badge>
        </div>
        
        {loading ? (
          <div className="text-center py-8 text-slate-500">Kraunama...</div>
        ) : reflections.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <div className="text-4xl mb-3">✅</div>
            <p>Visos refleksijos peržiūrėtos!</p>
            <p className="text-sm mt-1">Čia bus rodomos mokinių pateiktos refleksijos</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reflections.slice(0, 3).map(r => (
              <Link key={r.id} to={`${ROUTES.TEACHER_REFLECTION_DETAIL}`.replace(':id', r.id)}>
                <div 
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="text-2xl">📝</div>
                    <div>
                      <div className="font-medium text-slate-900">{r.studentName}</div>
                      <div className="text-sm text-slate-500">
                        {new Date(r.createdAt).toLocaleDateString('lt-LT')}
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" asChild>Peržiūrėti →</Button>
                </div>
              </Link>
            ))}
            {reflections.length > 3 && (
              <Link to={ROUTES.TEACHER_REVIEW}>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full"
                >
                  Rodyti visas ({reflections.length}) →
                </Button>
              </Link>
            )}
          </div>
        )}
      </Card>

      {/* Classes overview */}
      <Card className="mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <h2 className="font-semibold text-xl text-slate-900">Mano klasės</h2>
          <Link to={ROUTES.TEACHER_CLASSES}>
            <Button 
              size="sm" 
              variant="secondary"
            >
              + Pridėti klasę
            </Button>
          </Link>
        </div>
        
        {loading ? (
          <div className="text-center py-8 text-slate-500">Kraunama...</div>
        ) : (
          <div className="space-y-3">
            {classes.map((cls, idx) => {
              const colors = ['blue', 'green', 'amber', 'rose', 'purple'];
              const color = colors[idx % colors.length];
              return (
                <Link key={cls.id} to={ROUTES.TEACHER_CLASSES}>
                  <div 
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`w-10 h-10 bg-${color}-100 rounded-lg flex items-center justify-center text-${color}-600 font-semibold`}>
                        {cls.name}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">{cls.name} klasė</div>
                        <div className="text-sm text-slate-500">{cls.studentIds?.length || 0} mokiniai</div>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" asChild>Peržiūrėti →</Button>
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
          <div className="text-2xl sm:text-3xl font-bold text-blue-600">{classes.length}</div>
          <div className="text-xs sm:text-sm text-slate-600 mt-2">Klasės</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl sm:text-3xl font-bold text-green-600">
            {classes.reduce((sum, cls) => sum + (cls.studentIds?.length || 0), 0)}
          </div>
          <div className="text-xs sm:text-sm text-slate-600 mt-2">Mokiniai</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl sm:text-3xl font-bold text-amber-600">{reflections.length}</div>
          <div className="text-xs sm:text-sm text-slate-600 mt-2">Laukia peržiūros</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl sm:text-3xl font-bold text-slate-600">{tasks.length}</div>
          <div className="text-xs sm:text-sm text-slate-600 mt-2">Aktyvios užduotys</div>
        </Card>
      </div>
    </Layout>
  );
}
